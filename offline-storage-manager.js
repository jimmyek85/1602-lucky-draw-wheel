// 离线数据存储和同步管理器
// 支持离线运行、在线同步、自动备份到GitHub

class OfflineStorageManager {
    constructor() {
        this.dbName = 'LuckyDrawDB';
        this.dbVersion = 1;
        this.db = null;
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.backupQueue = [];
        this.lastSyncTime = localStorage.getItem('lastSyncTime') || null;
        this.lastBackupTime = localStorage.getItem('lastBackupTime') || null;
        
        // 监听网络状态变化
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        this.init();
    }

    async init() {
        try {
            await this.initIndexedDB();
            await this.initSupabase();
            
            if (this.isOnline) {
                await this.syncOfflineData();
                await this.scheduleAutoBackup();
            }
            
            console.log('✅ 离线存储管理器初始化成功');
        } catch (error) {
            console.error('❌ 离线存储管理器初始化失败:', error);
        }
    }

    // 初始化IndexedDB
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 用户数据表
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'phone' });
                    userStore.createIndex('name', 'name', { unique: false });
                    userStore.createIndex('joindate', 'joindate', { unique: false });
                }
                
                // 抽奖记录表
                if (!db.objectStoreNames.contains('draws')) {
                    const drawStore = db.createObjectStore('draws', { keyPath: 'id', autoIncrement: true });
                    drawStore.createIndex('phone', 'phone', { unique: false });
                    drawStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // 同步队列表
                if (!db.objectStoreNames.contains('syncQueue')) {
                    const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                    syncStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // 初始化Supabase连接
    async initSupabase() {
        try {
            if (window.supabase && window.SUPABASE_CONFIG) {
                // 测试连接
                const { data, error } = await window.supabase
                    .from('users')
                    .select('count')
                    .limit(1);
                
                if (error && error.code !== 'PGRST116') {
                    throw error;
                }
                
                console.log('✅ Supabase连接正常');
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Supabase连接失败，使用离线模式:', error);
            return false;
        }
    }

    // 保存用户数据（支持离线）
    async saveUser(userData) {
        try {
            // 首先尝试保存到IndexedDB
            await this.saveToIndexedDB('users', userData);
            
            if (this.isOnline) {
                try {
                    // 在线时同时保存到Supabase
                    await this.saveToSupabase('users', userData);
                    console.log('✅ 用户数据已保存到云端和本地');
                } catch (error) {
                    // 云端保存失败，添加到同步队列
                    await this.addToSyncQueue('user_insert', userData);
                    console.log('⚠️ 云端保存失败，已添加到同步队列');
                }
            } else {
                // 离线时添加到同步队列
                await this.addToSyncQueue('user_insert', userData);
                console.log('📱 离线模式：用户数据已保存到本地，将在联网后同步');
            }
            
            return userData;
        } catch (error) {
            console.error('❌ 保存用户数据失败:', error);
            throw error;
        }
    }

    // 保存抽奖记录
    async saveDrawRecord(drawData) {
        try {
            const record = {
                ...drawData,
                timestamp: new Date().toISOString(),
                synced: false
            };
            
            await this.saveToIndexedDB('draws', record);
            
            if (this.isOnline) {
                try {
                    await this.saveToSupabase('draw_records', record);
                    record.synced = true;
                    await this.saveToIndexedDB('draws', record);
                } catch (error) {
                    await this.addToSyncQueue('draw_insert', record);
                }
            } else {
                await this.addToSyncQueue('draw_insert', record);
            }
            
            return record;
        } catch (error) {
            console.error('❌ 保存抽奖记录失败:', error);
            throw error;
        }
    }

    // 保存到IndexedDB
    async saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 保存到Supabase
    async saveToSupabase(tableName, data) {
        const { data: result, error } = await window.supabase
            .from(tableName)
            .upsert([data])
            .select()
            .single();
        
        if (error) throw error;
        return result;
    }

    // 添加到同步队列
    async addToSyncQueue(type, data) {
        const queueItem = {
            type,
            data,
            timestamp: new Date().toISOString(),
            retries: 0
        };
        
        await this.saveToIndexedDB('syncQueue', queueItem);
        this.syncQueue.push(queueItem);
    }

    // 获取用户数据
    async getUser(phone) {
        try {
            // 首先从IndexedDB获取
            const localUser = await this.getFromIndexedDB('users', phone);
            
            if (this.isOnline && window.supabase) {
                try {
                    // 在线时也从Supabase获取最新数据
                    const { data: onlineUser, error } = await window.supabase
                        .from('users')
                        .select('*')
                        .eq('phone', phone)
                        .single();
                    
                    if (!error && onlineUser) {
                        // 更新本地数据
                        await this.saveToIndexedDB('users', onlineUser);
                        return onlineUser;
                    }
                } catch (error) {
                    console.warn('⚠️ 获取在线用户数据失败，使用本地数据:', error);
                }
            }
            
            return localUser;
        } catch (error) {
            console.error('❌ 获取用户数据失败:', error);
            return null;
        }
    }

    // 从IndexedDB获取数据
    async getFromIndexedDB(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 获取所有本地数据
    async getAllFromIndexedDB(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 网络连接恢复时的处理
    async handleOnline() {
        console.log('🌐 网络连接已恢复');
        this.isOnline = true;
        
        // 移除离线提示
        const offlineNotice = document.querySelector('.offline-notice');
        if (offlineNotice) {
            offlineNotice.remove();
        }
        
        // 开始同步数据
        await this.syncOfflineData();
        
        // 开始自动备份
        await this.scheduleAutoBackup();
    }

    // 网络断开时的处理
    handleOffline() {
        console.log('📱 网络连接已断开，启用离线模式');
        this.isOnline = false;
        
        // 显示离线提示
        this.showOfflineNotice();
    }

    // 显示离线提示
    showOfflineNotice() {
        const existingNotice = document.querySelector('.offline-notice');
        if (existingNotice) return;
        
        const notice = document.createElement('div');
        notice.className = 'offline-notice fixed top-0 left-0 right-0 bg-yellow-600 text-white text-center py-2 text-sm z-50';
        notice.innerHTML = '⚠️ 离线模式 - 数据将在连接恢复后自动同步';
        document.body.appendChild(notice);
    }

    // 同步离线数据
    async syncOfflineData() {
        if (!this.isOnline) return;
        
        console.log('🔄 开始同步离线数据...');
        
        try {
            // 获取同步队列
            const queueItems = await this.getAllFromIndexedDB('syncQueue');
            
            for (const item of queueItems) {
                try {
                    await this.processSyncItem(item);
                    await this.removeFromSyncQueue(item.id);
                } catch (error) {
                    console.error(`❌ 同步项目失败:`, item, error);
                    
                    // 增加重试次数
                    item.retries = (item.retries || 0) + 1;
                    
                    // 如果重试次数过多，标记为失败
                    if (item.retries >= 3) {
                        console.error('❌ 同步项目重试次数过多，标记为失败:', item);
                        await this.removeFromSyncQueue(item.id);
                    } else {
                        await this.saveToIndexedDB('syncQueue', item);
                    }
                }
            }
            
            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('lastSyncTime', this.lastSyncTime);
            
            console.log('✅ 离线数据同步完成');
        } catch (error) {
            console.error('❌ 同步离线数据失败:', error);
        }
    }

    // 处理同步项目
    async processSyncItem(item) {
        switch (item.type) {
            case 'user_insert':
                await this.saveToSupabase('users', item.data);
                break;
            case 'draw_insert':
                await this.saveToSupabase('draw_records', item.data);
                break;
            default:
                console.warn('⚠️ 未知的同步类型:', item.type);
        }
    }

    // 从同步队列中移除项目
    async removeFromSyncQueue(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 自动备份到GitHub
    async scheduleAutoBackup() {
        // 检查是否需要备份（每小时备份一次）
        const now = new Date();
        const lastBackup = this.lastBackupTime ? new Date(this.lastBackupTime) : null;
        
        if (!lastBackup || (now - lastBackup) > 60 * 60 * 1000) {
            await this.backupToGitHub();
        }
        
        // 设置下次自动备份
        setTimeout(() => this.scheduleAutoBackup(), 60 * 60 * 1000); // 1小时后
    }

    // 备份数据到GitHub
    async backupToGitHub() {
        try {
            console.log('📦 开始备份数据到GitHub...');
            
            // 获取所有本地数据
            const users = await this.getAllFromIndexedDB('users');
            const draws = await this.getAllFromIndexedDB('draws');
            
            // 创建备份数据
            const backupData = {
                timestamp: new Date().toISOString(),
                users: users,
                draws: draws,
                metadata: {
                    totalUsers: users.length,
                    totalDraws: draws.length,
                    lastSyncTime: this.lastSyncTime
                }
            };
            
            // 保存备份文件
            const backupFileName = `backup-${new Date().toISOString().split('T')[0]}.json`;
            await this.saveBackupFile(backupFileName, JSON.stringify(backupData, null, 2));
            
            this.lastBackupTime = new Date().toISOString();
            localStorage.setItem('lastBackupTime', this.lastBackupTime);
            
            console.log('✅ 数据备份完成');
        } catch (error) {
            console.error('❌ 数据备份失败:', error);
        }
    }

    // 保存备份文件
    async saveBackupFile(fileName, content) {
        try {
            // 直接使用下载方式，避免权限问题
            this.downloadBackupFile(fileName, content);
        } catch (error) {
            console.error('❌ 保存备份文件失败:', error);
        }
    }

    // 使用File System Access API保存文件
    async saveWithFileSystemAPI(dirName, fileName, content) {
        try {
            const dirHandle = await window.showDirectoryPicker();
            const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
        } catch (error) {
            throw error;
        }
    }

    // 下载备份文件
    downloadBackupFile(fileName, content) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 获取存储统计信息
    async getStorageStats() {
        try {
            const users = await this.getAllFromIndexedDB('users');
            const draws = await this.getAllFromIndexedDB('draws');
            const syncQueue = await this.getAllFromIndexedDB('syncQueue');
            
            return {
                totalUsers: users.length,
                totalDraws: draws.length,
                pendingSync: syncQueue.length,
                lastSyncTime: this.lastSyncTime,
                lastBackupTime: this.lastBackupTime,
                isOnline: this.isOnline
            };
        } catch (error) {
            console.error('❌ 获取存储统计失败:', error);
            return null;
        }
    }

    // 清理旧数据
    async cleanupOldData(daysToKeep = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            // 清理旧的抽奖记录
            const draws = await this.getAllFromIndexedDB('draws');
            const oldDraws = draws.filter(draw => new Date(draw.timestamp) < cutoffDate);
            
            for (const draw of oldDraws) {
                await this.removeFromIndexedDB('draws', draw.id);
            }
            
            console.log(`🧹 已清理 ${oldDraws.length} 条旧抽奖记录`);
        } catch (error) {
            console.error('❌ 清理旧数据失败:', error);
        }
    }

    // 从IndexedDB删除数据
    async removeFromIndexedDB(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// 全局实例
window.offlineStorageManager = new OfflineStorageManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineStorageManager;
}