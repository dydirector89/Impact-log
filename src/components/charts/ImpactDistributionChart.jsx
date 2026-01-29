import { useMemo, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ACTIVITY_TYPES } from '../../utils/calculations';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ImpactDistributionChart({ activities, title = 'Impact by Category' }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const chartRef = useRef(null);
    const [tooltipData, setTooltipData] = useState(null);

    const chartData = useMemo(() => {
        const approved = activities.filter(a => a.status === 'approved');
        const typeStats = {};

        approved.forEach(a => {
            if (!typeStats[a.activity_type]) {
                typeStats[a.activity_type] = 0;
            }
            typeStats[a.activity_type] += a.impact_score || 0;
        });

        const sortedTypes = Object.entries(typeStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        const colors = [
            '#10b981',
            '#3b82f6',
            '#8b5cf6',
            '#f59e0b',
            '#ec4899',
            '#14b8a6',
        ];

        return {
            labels: sortedTypes.map(([type]) => ACTIVITY_TYPES[type]?.label || type),
            datasets: [
                {
                    data: sortedTypes.map(([, value]) => value),
                    backgroundColor: colors,
                    borderColor: 'transparent',
                    borderWidth: 0,
                    hoverOffset: 0,
                },
            ],
        };
    }, [activities]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
                external: (context) => {
                    const { tooltip } = context;
                    if (tooltip.opacity === 0) {
                        setTooltipData(null);
                        return;
                    }

                    const dataIndex = tooltip.dataPoints?.[0]?.dataIndex;
                    if (dataIndex !== undefined) {
                        const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                        const value = chartData.datasets[0].data[dataIndex];
                        const percentage = ((value / total) * 100).toFixed(1);
                        setTooltipData({
                            label: chartData.labels[dataIndex],
                            value: value.toFixed(0),
                            percentage,
                            color: chartData.datasets[0].backgroundColor[dataIndex],
                        });
                    }
                },
            },
        },
    };

    const totalImpact = activities
        .filter(a => a.status === 'approved')
        .reduce((sum, a) => sum + (a.impact_score || 0), 0);

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1 pt-2">
                {/* Chart wrapper with centered text */}
                <div
                    className="relative w-48 h-48 flex items-center justify-center"
                    onMouseLeave={() => setTooltipData(null)}
                >
                    <Doughnut ref={chartRef} data={chartData} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-primary">
                            {totalImpact.toFixed(0)}
                        </span>
                        <span className="text-xs text-muted-foreground">Total Points</span>
                    </div>
                </div>

                {/* Custom tooltip below chart */}
                <div className="h-8 mt-2 flex items-center justify-center">
                    {tooltipData && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm animate-in fade-in-0 zoom-in-95 duration-150">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tooltipData.color }}
                            />
                            <span className="font-medium">{tooltipData.label}</span>
                            <span className="text-slate-300">
                                {tooltipData.value} pts ({tooltipData.percentage}%)
                            </span>
                        </div>
                    )}
                </div>

                {/* Legend below */}
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                    {chartData.labels.map((label, index) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                            />
                            <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
