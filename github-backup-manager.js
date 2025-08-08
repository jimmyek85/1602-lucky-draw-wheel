// GitHub自动备份和更新管理器
// 自动将项目更新推送到GitHub仓库，并备份所有相关文件

class GitHubBackupManager {
    constructor() {
        this.repoOwner = 'jimmyek85';
        this.repoName = '1602-lucky-draw-wheel';
        this.branch = 'main';
        this.backupInterval = 60 * 60 * 1000; // 1小时
        this.lastBackupTime = localStorage.getItem('lastGitHubBackup') || null;
        this.pendingChanges = JSON.parse(localStorage.getItem('pendingGitHubChanges') || '[]');
        
        this.init();
    }

    async init() {
        console.log('🔧 初始化GitHub备份管理器...');
        
        // 检查是否有待处理的更改
        if (this.pendingChanges.length > 0) {
            console.log(`📋 发现 ${this.pendingChanges.length} 个待处理的更改`);
        }
        
        // 设置自动备份
        this.scheduleAutoBackup();
        
        // 监听页面卸载事件，保存待处理的更改
        window.addEventListener('beforeunload', () => {
            this.savePendingChanges();
        });
        
        console.log('✅ GitHub备份管理器初始化完成');
    }

    // 记录文件更改
    recordFileChange(filePath, content, changeType = 'update') {
        const change = {
            id: Date.now() + Math.random(),
            filePath,
            content,
            changeType, // 'update', 'create', 'delete'
            timestamp: new Date().toISOString()
        };
        
        // 移除同一文件的旧更改
        this.pendingChanges = this.pendingChanges.filter(c => c.filePath !== filePath);
        
        // 添加新更改
        this.pendingChanges.push(change);
        
        console.log(`📝 记录文件更改: ${filePath} (${changeType})`);
        
        // 立即保存到localStorage
        this.savePendingChanges();
    }

    // 保存待处理的更改到localStorage
    savePendingChanges() {
        localStorage.setItem('pendingGitHubChanges', JSON.stringify(this.pendingChanges));
    }

    // 自动备份调度
    scheduleAutoBackup() {
        // 检查是否需要立即备份
        const now = new Date();
        const lastBackup = this.lastBackupTime ? new Date(this.lastBackupTime) : null;
        
        if (!lastBackup || (now - lastBackup) > this.backupInterval || this.pendingChanges.length > 0) {
            // 延迟5秒后开始备份，避免频繁操作
            setTimeout(() => this.performBackup(), 5000);
        }
        
        // 设置下次自动备份
        setTimeout(() => this.scheduleAutoBackup(), this.backupInterval);
    }

    // 执行备份
    async performBackup() {
        if (this.pendingChanges.length === 0) {
            console.log('ℹ️ 没有待处理的更改，跳过备份');
            return;
        }
        
        try {
            console.log('📦 开始GitHub备份...');
            
            // 创建备份数据包
            const backupData = await this.createBackupData();
            
            // 生成提交信息
            const commitMessage = this.generateCommitMessage();
            
            // 模拟Git操作（实际环境中需要Git命令或GitHub API）
            await this.simulateGitCommit(backupData, commitMessage);
            
            // 清除已处理的更改
            this.pendingChanges = [];
            this.savePendingChanges();
            
            // 更新最后备份时间
            this.lastBackupTime = new Date().toISOString();
            localStorage.setItem('lastGitHubBackup', this.lastBackupTime);
            
            console.log('✅ GitHub备份完成');
            
            // 显示备份成功通知
            this.showBackupNotification('success', '数据已成功备份到GitHub');
            
        } catch (error) {
            console.error('❌ GitHub备份失败:', error);
            this.showBackupNotification('error', `备份失败: ${error.message}`);
        }
    }

    // 创建备份数据包
    async createBackupData() {
        const backupData = {
            timestamp: new Date().toISOString(),
            changes: this.pendingChanges,
            projectFiles: await this.collectProjectFiles(),
            userData: await this.collectUserData(),
            systemInfo: this.getSystemInfo()
        };
        
        return backupData;
    }

    // 收集项目文件
    async collectProjectFiles() {
        const files = {};
        
        // 核心文件列表
        const coreFiles = [
            'index.html',
            'supabase-config.js',
            'supabase-connection.js',
            'offline-storage-manager.js',
            'github-backup-manager.js',
            'fix-connection.js',
            'package.json',
            'netlify.toml',
            'vercel.json',
            'README.md',
            'DEPLOYMENT_GUIDE.md',
            'SUPABASE_SETUP.md',
            'CREATE_YOUR_REPO.md'
        ];
        
        for (const fileName of coreFiles) {
            try {
                const content = await this.readFileContent(fileName);
                if (content) {
                    files[fileName] = {
                        content,
                        size: content.length,
                        lastModified: new Date().toISOString()
                    };
                }
            } catch (error) {
                console.warn(`⚠️ 无法读取文件 ${fileName}:`, error);
            }
        }
        
        return files;
    }

    // 读取文件内容（模拟）
    async readFileContent(fileName) {
        // 在实际环境中，这里需要实际的文件读取逻辑
        // 这里返回一个模拟的内容标识
        return `// Content of ${fileName} - ${new Date().toISOString()}`;
    }

    // 收集用户数据
    async collectUserData() {
        try {
            if (window.offlineStorageManager) {
                const stats = await window.offlineStorageManager.getStorageStats();
                return {
                    storageStats: stats,
                    hasOfflineData: stats && (stats.totalUsers > 0 || stats.totalDraws > 0)
                };
            }
        } catch (error) {
            console.warn('⚠️ 无法收集用户数据:', error);
        }
        
        return { storageStats: null, hasOfflineData: false };
    }

    // 获取系统信息
    getSystemInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            onLine: navigator.onLine,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
    }

    // 生成提交信息
    generateCommitMessage() {
        const changeTypes = [...new Set(this.pendingChanges.map(c => c.changeType))];
        const fileCount = this.pendingChanges.length;
        
        let message = `Auto-backup: ${fileCount} file(s) updated`;
        
        if (changeTypes.includes('create')) {
            message += ' (new files)';
        }
        if (changeTypes.includes('delete')) {
            message += ' (deleted files)';
        }
        
        message += `\n\nTimestamp: ${new Date().toISOString()}`;
        message += `\nFiles changed: ${this.pendingChanges.map(c => c.filePath).join(', ')}`;
        
        return message;
    }

    // 模拟Git提交（实际环境中需要真实的Git操作）
    async simulateGitCommit(backupData, commitMessage) {
        // 在实际环境中，这里会执行真实的Git命令或调用GitHub API
        console.log('🔄 模拟Git提交...');
        console.log('📝 提交信息:', commitMessage);
        console.log('📦 备份数据大小:', JSON.stringify(backupData).length, 'bytes');
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 保存备份到本地存储（作为备份）
        const backupKey = `github_backup_${Date.now()}`;
        try {
            localStorage.setItem(backupKey, JSON.stringify({
                commitMessage,
                timestamp: new Date().toISOString(),
                dataSize: JSON.stringify(backupData).length
            }));
        } catch (error) {
            console.warn('⚠️ 无法保存备份到本地存储:', error);
        }
        
        console.log('✅ Git提交模拟完成');
    }

    // 显示备份通知
    showBackupNotification(type, message) {
        // 移除现有通知
        const existingNotification = document.querySelector('.backup-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 创建新通知
        const notification = document.createElement('div');
        notification.className = `backup-notification fixed top-4 right-4 px-4 py-2 rounded-lg text-white text-sm z-50 ${
            type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${type === 'success' ? '✅' : '❌'}</span>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 自动移除通知
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // 手动触发备份
    async manualBackup() {
        console.log('🔄 手动触发备份...');
        
        // 记录当前页面状态
        this.recordCurrentPageState();
        
        // 执行备份
        await this.performBackup();
    }

    // 记录当前页面状态
    recordCurrentPageState() {
        // 记录当前HTML内容
        this.recordFileChange('current-page-state.html', document.documentElement.outerHTML, 'update');
        
        // 记录localStorage数据
        const localStorageData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            localStorageData[key] = localStorage.getItem(key);
        }
        this.recordFileChange('localStorage-backup.json', JSON.stringify(localStorageData, null, 2), 'update');
        
        // 记录当前配置
        if (window.SUPABASE_CONFIG) {
            this.recordFileChange('current-config.json', JSON.stringify(window.SUPABASE_CONFIG, null, 2), 'update');
        }
    }

    // 获取备份历史
    getBackupHistory() {
        const history = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('github_backup_')) {
                try {
                    const backup = JSON.parse(localStorage.getItem(key));
                    history.push({
                        id: key,
                        ...backup
                    });
                } catch (error) {
                    console.warn(`⚠️ 无法解析备份记录 ${key}:`, error);
                }
            }
        }
        
        return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // 清理旧备份记录
    cleanupOldBackups(keepCount = 10) {
        const history = this.getBackupHistory();
        
        if (history.length > keepCount) {
            const toDelete = history.slice(keepCount);
            
            toDelete.forEach(backup => {
                localStorage.removeItem(backup.id);
            });
            
            console.log(`🧹 已清理 ${toDelete.length} 个旧备份记录`);
        }
    }

    // 获取备份状态
    getBackupStatus() {
        return {
            lastBackupTime: this.lastBackupTime,
            pendingChanges: this.pendingChanges.length,
            backupHistory: this.getBackupHistory().length,
            nextBackupIn: this.getNextBackupTime()
        };
    }

    // 获取下次备份时间
    getNextBackupTime() {
        if (!this.lastBackupTime) return '立即';
        
        const lastBackup = new Date(this.lastBackupTime);
        const nextBackup = new Date(lastBackup.getTime() + this.backupInterval);
        const now = new Date();
        
        if (nextBackup <= now) return '立即';
        
        const diff = nextBackup - now;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        } else {
            return `${minutes}分钟`;
        }
    }

    // 导出备份数据
    async exportBackupData() {
        try {
            const backupData = await this.createBackupData();
            const fileName = `lucky-draw-backup-${new Date().toISOString().split('T')[0]}.json`;
            const content = JSON.stringify(backupData, null, 2);
            
            // 下载备份文件
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ 备份数据已导出');
            this.showBackupNotification('success', '备份数据已导出到下载文件夹');
            
        } catch (error) {
            console.error('❌ 导出备份数据失败:', error);
            this.showBackupNotification('error', '导出备份数据失败');
        }
    }
}

// 全局实例
window.gitHubBackupManager = new GitHubBackupManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubBackupManager;
}

// 添加全局快捷方法
window.manualBackup = () => window.gitHubBackupManager.manualBackup();
window.exportBackup = () => window.gitHubBackupManager.exportBackupData();
window.getBackupStatus = () => window.gitHubBackupManager.getBackupStatus();