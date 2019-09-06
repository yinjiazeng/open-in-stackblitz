const { browserAction, tabs } = chrome;
// 根据tabId存储仓库url
const repositoryUrls = {};

const getIcons = (type = 'disable') => {
    const data = {};
    const size = ['16', '48', '128'];
    size.forEach((value) => {
        data[value] = `icons/${value}_${type}.png`;
    });
    return data;
};

// 根据地址判定图标是否高亮
const checkbrowserAction = ({ url, id: tabId }) => {
    const match = url.match(/^(https?:\/\/(www\.)?github.com\/?)(.*)$/);
    if (!!match && !!match[3]) {
        const arr = match[3].split('/');
        if (arr.length > 1) {
            const [userName, repositoryName] = arr;
            repositoryUrls[tabId] = `${userName}/${repositoryName}`;
            browserAction.setIcon({
                tabId,
                path: getIcons('enable'),
            });
            return;
        }
    }
    if (!!repositoryUrls[tabId]) {
        delete repositoryUrls[tabId];
        browserAction.setIcon({
            tabId,
            path: getIcons(),
        });
    }
};

// 页签刷新或者修改地址
tabs.onUpdated.addListener((tabId, { status }) => {
    if (status === 'loading') {
        tabs.get(tabId, (activeTab) => {
            checkbrowserAction(activeTab);
        });
    }
});

// 选中页签
tabs.onActivated.addListener(({ tabId }) => {
    tabs.get(tabId, (activeTab) => {
        checkbrowserAction(activeTab);
    });
});

// 初始化检测图标是否匹配github网站
tabs.getAllInWindow(undefined, (tabs) => {
    const activeTab = tabs.find(({ active }) => active);
    if (activeTab) {
        checkbrowserAction(activeTab);
    }
});

//点击图标用stackblitz打开github仓库
browserAction.onClicked.addListener(({ id }) => {
    const repositoryUrl = repositoryUrls[id];
    if (!!repositoryUrl) {
        chrome.tabs.create({ url: `https://www.stackblitz.com/github/${repositoryUrl}` });
    }
});