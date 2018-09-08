import { SystemSetting } from "./SystemSetting";

/**
 * 客户端程序会用到的一些设置
 */

//侧边栏功能区按钮的最上面显示程序logo
SystemSetting.addSystemSetting('client.sidebar.showLogo', true, false, 'boolean');

//侧边栏功能区logo添加一些内边距
SystemSetting.addSystemSetting('client.sidebar.logoPadding', true, false, 'boolean');   