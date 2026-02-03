import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

export default function CO2SavingsChart({ data = [], title = 'CO₂ Savings Over Time' }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    // Safety check - ensure data is valid array
    const safeData = Array.isArray(data) ? data : [];
    const totalCO2 = safeData.reduce((sum, d) => sum + (d?.co2Saved || 0), 0);
    const hasData = safeData.length > 0 && totalCO2 > 0;

    const chartData = useMemo(() => {
        if (!hasData) {
            return {
                labels: [],
                datasets: [{
                    label: 'CO₂ Saved (kg)',
                    data: [],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                }],
            };
        }
        return {
            labels: safeData.map(d => d?.month || ''),
            datasets: [
                {
                    label: 'CO₂ Saved (kg)',
                    data: safeData.map(d => d?.co2Saved || 0),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 0,
                    borderRadius: 0,
                    hoverBackgroundColor: '#10b981',
                },
            ],
        };
    }, [safeData, hasData]);

    const tickColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#f1f5f9';

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: isDark ? '#0f172a' : '#1e293b',
                titleFont: { size: 14, weight: '600' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => `${(context.raw || 0).toFixed(1)} kg CO₂ saved`,
                },
            },
            datalabels: {
                anchor: 'end',
                align: 'top',
                offset: 4,
                color: isDark ? '#e2e8f0' : '#374151',
                font: {
                    size: 12,
                    weight: 'bold',
                },
                formatter: (value) => value > 0 ? `${value.toFixed(0)}` : '',
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { size: 12, weight: '500' },
                    color: tickColor,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: gridColor,
                },
                ticks: {
                    font: { size: 12 },
                    color: tickColor,
                    callback: (value) => `${value} kg`,
                },
            },
        },
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {hasData ? 'Total savings over the period' : 'No activity data yet'}
                        </p>
                    </div>
                    {hasData && (
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gradient">{totalCO2.toFixed(1)} kg</p>
                            <p className="text-xs text-muted-foreground">CO₂ saved</p>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-48 sm:h-60">
                    {hasData ? (
                        <Bar data={chartData} options={options} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/30 rounded-lg">
                            <div className="text-4xl mb-2">📊</div>
                            <p className="text-lg font-medium">No data yet</p>
                            <p className="text-sm text-center max-w-[200px]">
                                CO₂ savings will appear here once activities are approved
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
