import * as React from 'react';
import * as moment from 'moment';
import * as echarts from 'echarts/lib/echarts';
import { oVar } from 'observable-variable';
import { DiskUsage } from 'diskusage';
import debounce = require('lodash.debounce');

import { showMessageBox } from '../../../../../../../MessageBox/MessageBox';
import { BaseSettingGroup } from "../BaseSettingGroup/BaseSettingGroup";
import { ServerApi } from '../../../../../../../../global/ServerApi';
import { ObservableComponentWrapper } from '../../../../../../../../global/Tools/ObservableComponent';

const less = require('./SystemInfo.less');

//加载需要的模块
require('echarts/lib/chart/line');
require('echarts/lib/component/title');

export class SystemInfo extends BaseSettingGroup {

    private readonly _cpuNumber = oVar(0);
    private readonly _cpuName = oVar('unknown');
    private readonly _cpuUsage = oVar(0);
    private readonly _totalMemory = oVar(0);
    private readonly _freeMemory = oVar(0);
    private readonly _uptime = oVar(0);
    private readonly _userDataDir = oVar<DiskUsage>({ available: 0, free: 0, total: 0 }, { deepCompare: true });
    private readonly _programDataDir = oVar<DiskUsage>({ available: 0, free: 0, total: 0 }, { deepCompare: true });

    private _chart_div: HTMLDivElement;
    private _chart: echarts.ECharts;

    protected _groupName = '系统信息';

    protected _subGroup = [
        {
            name: '硬件信息',
            items: [
                (
                    <div className={less.hardwareInfo}>
                        <ObservableComponentWrapper watch={[this._cpuName]} render={() => <div>CPU名称：{this._cpuName.value}</div>} />
                        <ObservableComponentWrapper watch={[this._cpuNumber]} render={() => <div>CPU核心数：{this._cpuNumber.value}</div>} />
                        <ObservableComponentWrapper watch={[this._totalMemory]} render={() => <div>内存大小：{(this._totalMemory.value / 1024 / 1024 / 1024).toFixed(2)}GB</div>} />
                        <ObservableComponentWrapper watch={[this._uptime]} render={() => <div>启动时间：{moment(this._uptime.value).format('YYYY-MM-DD HH:mm:ss')}</div>} />
                        <ObservableComponentWrapper watch={[this._userDataDir]} render={() => <div>用户数据分区大小：{(this._userDataDir.value.total / 1024 / 1024 / 1024).toFixed(2)}GB</div>} />
                        <ObservableComponentWrapper watch={[this._programDataDir]} render={() => <div>程序数据分区大小：{(this._programDataDir.value.total / 1024 / 1024 / 1024).toFixed(2)}GB</div>} />
                    </div>
                )
            ]
        },
        {
            name: '资源使用',
            items: [
                (
                    <div className={less.charts} ref={(e: any) => this._chart_div = e} />
                )
            ]
        }
    ];

    componentDidMount() {
        //#region 图表配置

        this._chart = echarts.init(this._chart_div, 'dark');

        //更改图表大小
        const observer: MutationObserver = new (window as any).ResizeObserver(debounce(() => this._chart.resize(), 100, { leading: true }));
        observer.observe(this._chart_div);
        this._unobserve.push(() => observer.disconnect());

        //图表配置
        const timeData: string[] = [];
        const cpuUsed: number[] = [];
        const cpuRemain: number[] = [];
        const memoryUsed: number[] = [];
        const memoryRemain: number[] = [];
        const userDataUsed: number[] = [];
        const userDataRemain: number[] = [];
        const programDataUsed: number[] = [];
        const programDataRemain: number[] = [];
        const title = ['CPU (%)', '内存 (MB)', '用户数据分区 (GB)', '程序数据分区 (GB)'];

        const chartOption: any = {
            color: title.map(() => ['#FF9900', '#339933']).reduce((pre, cur) => [...pre, ...cur]),
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                position(pt: number[]) {
                    return [pt[0], '10%'];
                },
                axisPointer: {
                    type: 'cross'
                }
            },
            title: title.map((text, index) => ({
                text,
                top: 0,
                left: `${index * 22.5 + (index + 1) * 2}%`,
                textStyle: {
                    fontSize: 13,
                    color: '#aaaba6'
                }
            })),
            grid: title.map((_, index) => ({
                top: 40,
                bottom: 0,
                left: `${index * 22.5 + (index + 1) * 2}%`,
                width: '22.5%',
                containLabel: true
            })),
            xAxis: title.map((_, index) => ({
                type: 'category',
                gridIndex: index,
                axisTick: {
                    alignWithLabel: true
                },
                axisLine: {
                    lineStyle: {
                        color: '#aaaba6'
                    }
                },
                axisPointer: {
                    label: {
                        backgroundColor: "#363636"
                    }
                },
                axisLabel: {
                    color: '#aaaba6'
                },
                data: timeData
            })),
            yAxis: title.map((_, index) => ({
                type: 'value',
                gridIndex: index,
                axisPointer: {
                    label: {
                        backgroundColor: "#363636"
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#aaaba6'
                    }
                },
                axisLabel: {
                    color: '#aaaba6'
                },
                nameTextStyle: {
                    color: '#aaaba6'
                },
            })),
            series: [
                {
                    name: 'CPU 已使用',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    smooth: true,
                    data: cpuUsed
                },
                {
                    name: 'CPU 剩余',
                    type: 'line',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    smooth: true,
                    data: cpuRemain
                },
                {
                    name: '内存 已使用',
                    type: 'line',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    smooth: true,
                    data: memoryUsed
                },
                {
                    name: '内存 剩余',
                    type: 'line',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    smooth: true,
                    data: memoryRemain
                },
                {
                    name: '用户数据分区 已使用',
                    type: 'line',
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    smooth: true,
                    data: userDataUsed
                },
                {
                    name: '用户数据分区 剩余',
                    type: 'line',
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    smooth: true,
                    data: userDataRemain
                },
                {
                    name: '程序数据分区 已使用',
                    type: 'line',
                    xAxisIndex: 3,
                    yAxisIndex: 3,
                    smooth: true,
                    data: programDataUsed
                },
                {
                    name: '程序数据分区 剩余',
                    type: 'line',
                    xAxisIndex: 3,
                    yAxisIndex: 3,
                    smooth: true,
                    data: programDataRemain
                },
            ]
        };

        const updateChart = () => {
            timeData.push(moment().format('HH:mm:ss'));

            cpuUsed.push(+this._cpuUsage.value.toFixed(2));
            cpuRemain.push(+(100 - this._cpuUsage.value).toFixed(2));
            memoryUsed.push(+((this._totalMemory.value - this._freeMemory.value) / 1024 / 1024).toFixed(2));
            memoryRemain.push(+(this._freeMemory.value / 1024 / 1024).toFixed(2));
            userDataUsed.push(+((this._userDataDir.value.total - this._userDataDir.value.free) / 1024 / 1024 / 1024).toFixed(2));
            userDataRemain.push(+((this._userDataDir.value.available) / 1024 / 1024 / 1024).toFixed(2));
            programDataUsed.push(+((this._programDataDir.value.total - this._programDataDir.value.free) / 1024 / 1024 / 1024).toFixed(2));
            programDataRemain.push(+((this._programDataDir.value.available) / 1024 / 1024 / 1024).toFixed(2));

            this._chart.setOption(chartOption);
        };

        //#endregion

        //#region 定时更新数据

        const updateData = async () => {
            try {
                const info = await ServerApi.task.getSystemHardwareInfo();
                this._cpuNumber.value = info.cpuNumber;
                this._cpuName.value = info.cpuName;
                this._cpuUsage.value = info.cpuUsage;
                this._totalMemory.value = info.totalMemory;
                this._freeMemory.value = info.freeMemory;
                this._uptime.value = info.uptime;
                this._userDataDir.value = info.userDataDir;
                this._programDataDir.value = info.programDataDir;
                updateChart();
            } catch (error) {
                showMessageBox({ icon: 'error', title: '获取服务器的硬件信息失败', content: error.message });
            }
        };

        const timer = setInterval(updateData, 5000);
        this._unobserve.push(() => clearInterval(timer));
        updateData();

        //#endregion        
    }
}