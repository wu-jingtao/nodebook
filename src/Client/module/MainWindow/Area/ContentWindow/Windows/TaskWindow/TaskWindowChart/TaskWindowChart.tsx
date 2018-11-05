import * as React from 'react';
import * as moment from 'moment';
import * as echarts from 'echarts/lib/echarts';
import * as classnames from 'classnames';
import { oVar } from 'observable-variable';
import debounce = require('lodash.debounce');

import { ObservableComponent } from '../../../../../../../global/Tools/ObservableComponent';
import { Container } from '../../../../../../../global/Component/Container/Container';
import { ServerApi } from '../../../../../../../global/ServerApi';
import { showMessageBox } from '../../../../../../MessageBox/MessageBox';
import { taskList } from '../../../../FunctionArea/FunctionPanel/TaskManager/TaskList';

//加载需要的模块
require('echarts/lib/chart/line');
require('echarts/lib/component/tooltip');
require('echarts/lib/component/legend');
require('echarts/lib/component/toolbox');

const less = require('./TaskWindowChart.less');

/**
 * 任务运行数据图表
 */
export class TaskWindowChart extends ObservableComponent<{ taskPath: string, className?: string }> {

    private _chartDom: HTMLDivElement;
    private _chart: echarts.ECharts;
    private readonly _status = taskList.get(this.props.taskPath);

    private readonly _pid = oVar<number>(0);
    private readonly _createTime = oVar<number>(0);
    private readonly _elapsed = oVar<number>(0);

    componentDidMount() {
        this.watch([this._pid, this._createTime, this._elapsed]);
        this._chart = echarts.init(this._chartDom, 'dark');

        //更改图表大小
        const observer: MutationObserver = new (window as any).ResizeObserver(debounce(() => this._chart.resize(), 100));
        observer.observe(this._chartDom);
        this._unobserve.push(() => observer.disconnect());

        //图表配置
        const chartOption: any = {
            color: ['#CD6600', '#00B2EE'],
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                position: function (pt: number[]) {
                    return [pt[0], '10%'];
                },
                axisPointer: {
                    type: 'cross'
                }
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
                }
            },
            legend: {
                data: ['CPU', '内存'],
                left: 'left',
                top: 5
            },
            grid: {
                top: 70,
                bottom: 25,
                left: 50,
                right: 50
            },
            xAxis: {
                type: 'category',
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
                data: []
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'CPU (%)',
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
                },
                {
                    type: 'value',
                    name: '内存 (MB)',
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
                }
            ],
            series: [
                {
                    name: 'CPU',
                    type: 'line',
                    yAxisIndex: 0,
                    smooth: true,
                    data: []
                },
                {
                    name: '内存',
                    type: 'line',
                    yAxisIndex: 1,
                    smooth: true,
                    data: []
                }
            ]
        };

        const updateData = async () => {
            if (this._status.value === 'running') {
                try {
                    const status = await ServerApi.task.getTaskResourcesConsumption(this.props.taskPath);
                    if (status) {
                        this._pid.value = status.pid;
                        this._createTime.value = status.timestamp - status.elapsed;
                        this._elapsed.value = status.elapsed;

                        chartOption.xAxis.data.push(moment().format('YYYY-MM-DD HH:mm:ss'));
                        chartOption.series[0].data.push((status.cpu).toFixed(2));
                        chartOption.series[1].data.push((status.memory / 1024 / 1024).toFixed(2));

                        this._chart.setOption(chartOption);
                    }
                } catch (error) {
                    showMessageBox({ icon: 'error', title: '获取任务资源消耗信息失败', content: `任务: ${this.props.taskPath}\n${error.message}` });
                }
            }
        };

        const timer = setInterval(updateData, 5000);
        this._unobserve.push(() => clearInterval(timer));
        updateData();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._chart.dispose();
    }

    render() {
        const elapsed = moment.duration(this._elapsed.value);

        return (
            <div className={classnames(less.TaskWindowChart, this.props.className)}>
                <Container className={less.info}>
                    <div className={less.infoItem}>进程号: {this._pid.value}</div>
                    <div className={less.infoItem}>启动时间: {moment(this._createTime.value).format('YYYY-MM-DD HH:mm:ss')}</div>
                    <div className={less.infoItem}>运行时间:
                        {elapsed.asDays() > 1 && `${Math.trunc(elapsed.asDays())}天&nbsp;`}
                        {elapsed.hours()}小时&nbsp;
                        {elapsed.minutes()}分钟&nbsp;
                        {elapsed.seconds()}秒
                    </div>
                </Container>
                <Container className={less.chart}>
                    <div ref={(e: any) => this._chartDom = e} />
                </Container>
            </div>
        );
    }
}