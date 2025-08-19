// 数据同步管理器
// 负责前后端数据传输和同步

class DataSyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.lastSyncTime = null;
        this.syncInProgress = false;
        
        // 监听网络状态变化
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        console.log('📡 数据同步管理器已初始化');
    }

    // 初始化
    async init() {
        try {
            // 检查Supabase连接
            await this.checkSupabaseConnection();
            
            // 如果有离线数据，开始同步
            if (this.isOnline) {
                await this.syncPendingData();
            }
            
            console.log('✅ 数据同步管理器初始化完成');
        } catch (error) {
            console.error('❌ 数据同步管理器初始化失败:', error);
        }
    }

    // 检查Supabase连接
    async checkSupabaseConnection() {
        try {
            if (!window.supabase) {
                throw new Error('Supabase客户端未初始化');
            }
            
            // 测试连接
            const { data, error } = await window.supabase
                .from('users')
                .select('count')
                .limit(1);
            
            if (error) {
                throw error;
            }
            
            this.isOnline = true;
            console.log('✅ Supabase连接正常');
            return true;
        } catch (error) {
            this.isOnline = false;
            console.warn('⚠️ Supabase连接失败:', error.message);
            return false;
        }
    }

    // 同步用户数据到Supabase
    async syncUserData(userData) {
        try {
            if (!this.isOnline) {
                // 离线时添加到同步队列
                this.addToSyncQueue('user_data', userData);
                console.log('📱 离线模式：用户数据已添加到同步队列');
                return { success: true, offline: true };
            }

            // 在线时直接同步
            const { data, error } = await window.supabase
                .from('users')
                .upsert([userData])
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('✅ 用户数据已同步到云端:', data);
            return { success: true, data: data };
        } catch (error) {
            console.error('❌ 用户数据同步失败:', error);
            
            // 同步失败时添加到队列
            this.addToSyncQueue('user_data', userData);
            return { success: false, error: error.message };
        }
    }

    // 同步抽奖记录
    async syncDrawRecord(drawData) {
        try {
            if (!this.isOnline) {
                this.addToSyncQueue('draw_record', drawData);
                console.log('📱 离线模式：抽奖记录已添加到同步队列');
                return { success: true, offline: true };
            }

            // 更新用户的抽奖次数和奖品记录
            const { data: userData, error: userError } = await window.supabase
                .from('users')
                .select('*')
                .eq('phone', drawData.userPhone)
                .single();

            if (userError) {
                throw userError;
            }

            // 更新用户数据
            const updatedUser = {
                ...userData,
                drawchances: (userData.drawchances || 1) - 1,
                prizeswon: [...(userData.prizeswon || []), {
                    prize: drawData.prize,
                    timestamp: drawData.timestamp
                }]
            };

            const { data: updateResult, error: updateError } = await window.supabase
                .from('users')
                .update(updatedUser)
                .eq('phone', drawData.userPhone)
                .select()
                .single();

            if (updateError) {
                throw updateError;
            }

            console.log('✅ 抽奖记录已同步到云端:', updateResult);
            return { success: true, data: updateResult };
        } catch (error) {
            console.error('❌ 抽奖记录同步失败:', error);
            this.addToSyncQueue('draw_record', drawData);
            return { success: false, error: error.message };
        }
    }

    // 添加到同步队列
    addToSyncQueue(type, data) {
        const queueItem = {
            id: Date.now() + Math.random(),
            type: type,
            data: data,
            timestamp: new Date().toISOString(),
            retries: 0
        };
        
        this.syncQueue.push(queueItem);
        
        // 保存到本地存储
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
        
        console.log(`📝 已添加到同步队列: ${type}`, queueItem);
    }

    // 同步待处理数据
    async syncPendingData() {
        if (this.syncInProgress || !this.isOnline) {
            return;
        }

        this.syncInProgress = true;
        console.log('🔄 开始同步待处理数据...');

        try {
            // 从本地存储加载同步队列
            const savedQueue = localStorage.getItem('syncQueue');
            if (savedQueue) {
                this.syncQueue = JSON.parse(savedQueue);
            }

            if (this.syncQueue.length === 0) {
                console.log('✅ 没有待同步数据');
                return;
            }

            const successfulSyncs = [];
            
            for (const item of this.syncQueue) {
                try {
                    let result;
                    
                    switch (item.type) {
                        case 'user_data':
                            result = await this.syncUserData(item.data);
                            break;
                        case 'draw_record':
                            result = await this.syncDrawRecord(item.data);
                            break;
                        default:
                            console.warn('⚠️ 未知的同步类型:', item.type);
                            continue;
                    }

                    if (result.success && !result.offline) {
                        successfulSyncs.push(item.id);
                        console.log(`✅ 同步成功: ${item.type}`);
                    } else {
                        item.retries = (item.retries || 0) + 1;
                        if (item.retries >= 3) {
                            console.error(`❌ 同步失败次数过多，移除项目: ${item.type}`);
                            successfulSyncs.push(item.id);
                        }
                    }
                } catch (error) {
                    console.error(`❌ 同步项目失败: ${item.type}`, error);
                    item.retries = (item.retries || 0) + 1;
                    if (item.retries >= 3) {
                        successfulSyncs.push(item.id);
                    }
                }
            }

            // 移除已成功同步的项目
            this.syncQueue = this.syncQueue.filter(item => !successfulSyncs.includes(item.id));
            localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));

            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('lastSyncTime', this.lastSyncTime);

            console.log(`✅ 数据同步完成，成功同步 ${successfulSyncs.length} 项`);
        } catch (error) {
            console.error('❌ 数据同步过程中发生错误:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // 网络连接恢复处理
    async handleOnline() {
        console.log('🌐 网络连接已恢复');
        this.isOnline = true;
        
        // 重新检查Supabase连接
        await this.checkSupabaseConnection();
        
        // 开始同步待处理数据
        setTimeout(() => {
            this.syncPendingData();
        }, 1000);
    }

    // 网络断开处理
    handleOffline() {
        console.log('📱 网络连接已断开');
        this.isOnline = false;
    }

    // 获取同步状态
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            pendingItems: this.syncQueue.length,
            lastSyncTime: this.lastSyncTime,
            syncInProgress: this.syncInProgress
        };
    }

    // 强制同步
    async forcSync() {
        if (this.isOnline) {
            await this.syncPendingData();
        } else {
            console.warn('⚠️ 离线状态，无法强制同步');
        }
    }

    // 清除同步队列
    clearSyncQueue() {
        this.syncQueue = [];
        localStorage.removeItem('syncQueue');
        console.log('🗑️ 同步队列已清除');
    }
}

// 创建全局实例
window.dataSyncManager = new DataSyncManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataSyncManager;
}

console.log('📡 数据同步管理器已加载');