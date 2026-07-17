import Chart from "react-apexcharts";
import {
  Users,
  DollarSign,
  TrendingUp,
  Building,
  ArrowUpRight,
  TrendingDown,
  Lock,
} from "lucide-react";
import { useDashboard } from "./useDashboard";
import "./dashboard.styles.css";

const formatCompactNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return "$0";
  
  const absNum = Math.abs(number);
  if (absNum >= 1.0e9) {
    const formatted = (number / 1.0e9).toFixed(1);
    return `$${formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted}B`;
  }
  if (absNum >= 1.0e6) {
    const formatted = (number / 1.0e6).toFixed(1);
    return `$${formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted}M`;
  }
  if (absNum >= 1.0e3) {
    const formatted = (number / 1.0e3).toFixed(1);
    return `$${formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted}K`;
  }
  return `$${number.toLocaleString()}`;
};

function Dashboard() {
  const {
    navigate,
    isEmployee,
    totalLeads,
    pipelineValue,
    winRate,
    companiesCount,
    loading,
    acquisitionTrend,
    distribution,
    recentActivities,
    conversion,
    getRelativeTime,
  } = useDashboard();

  const stats = [
    {
      title: "Total Leads",
      value: loading ? "..." : String(totalLeads),
      trend: "+12.5%",
      isPositive: true,
      icon: <Users size={22} />,
      type: "leads",
      path: "/leads",
    },
    {
      title: "Active Pipeline",
      value: loading ? "..." : (isEmployee ? "Restricted" : formatCompactNumber(pipelineValue)),
      trend: isEmployee ? "Locked" : "+8.3%",
      isPositive: !isEmployee,
      icon: isEmployee ? <Lock size={22} /> : <DollarSign size={22} />,
      type: "pipeline",
      path: isEmployee ? null : "/pipeline",
    },
    {
      title: "Win Rate",
      value: loading ? "..." : winRate,
      trend: "-1.5%",
      isPositive: false,
      icon: <TrendingUp size={22} />,
      type: "winrate",
      path: null,
    },
    {
      title: "Companies",
      value: loading ? "..." : String(companiesCount),
      trend: "+4 new",
      isPositive: true,
      icon: <Building size={22} />,
      type: "companies",
      path: "/companies",
    },
  ];

  const leadGrowthConfig = {
    series: [
      {
        name: "New Leads",
        data: acquisitionTrend.data.length ? acquisitionTrend.data : [0, 0, 0, 0, 0, 0],
      },
    ],
    options: {
      chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ["#6366f1"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      grid: {
        borderColor: "#f1f5f9",
        strokeDashArray: 5,
      },
      xaxis: {
        categories: acquisitionTrend.categories.length ? acquisitionTrend.categories : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        labels: { style: { colors: "#64748b", fontFamily: "Plus Jakarta Sans" } },
      },
      yaxis: {
        labels: { style: { colors: "#64748b", fontFamily: "Plus Jakarta Sans" } },
      },
      tooltip: {
        theme: "light",
      },
    },
  };

  const leadSourceConfig = {
    series: distribution.series.length ? distribution.series : [0, 0, 0, 0],
    options: {
      chart: {
        type: "donut",
      },
      labels: distribution.labels.length ? distribution.labels : ["Website", "LinkedIn", "Referrals", "Cold outreach"],
      colors: ["#6366f1", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
      legend: {
        position: "bottom",
        fontFamily: "Plus Jakarta Sans",
        labels: { colors: "#64748b" },
      },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total Leads",
                fontFamily: "Plus Jakarta Sans",
                fontSize: "14px",
                color: "#64748b",
                formatter: (w) => {
                  const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                  return String(sum > 0 ? sum : totalLeads);
                },
              },
            },
          },
        },
      },
      tooltip: {
        theme: "light",
      },
    },
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-title-bar">
        <h1>Dashboard Overview</h1>
        <p>Real-time updates of your sales pipelines, leads, and customer acquisitions.</p>
      </div>

      <div className="metrics-grid">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`metric-card ${stat.path ? "clickable" : ""}`}
            onClick={() => stat.path && navigate(stat.path)}
          >
            <div className="metric-card-info">
              <h3>{stat.title}</h3>
              <div className="value">{stat.value}</div>
              <div className={`trend ${stat.isPositive ? "up" : "down"}`}>
                {stat.isPositive ? <ArrowUpRight size={12} style={{ marginRight: 2 }} /> : <TrendingDown size={12} style={{ marginRight: 2 }} />}
                {stat.trend}
              </div>
            </div>
            <div className={`metric-icon-box ${stat.type}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h2>Lead Acquisition Trend</h2>
            <select>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <Chart
            options={leadGrowthConfig.options}
            series={leadGrowthConfig.series}
            type="area"
            height={300}
          />
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h2>Lead Distribution by Source</h2>
            <select>
              <option>All Sources</option>
            </select>
          </div>
          <Chart
            options={leadSourceConfig.options}
            series={leadSourceConfig.series}
            type="donut"
            height={300}
          />
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="recent-activity-card">
          <h2>Recent Activity Feed</h2>
          <div className="activity-list-items">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`activity-badge ${act.type === 'company' ? 'org' : act.type}`}>
                    {act.type === 'company' ? 'Company' : act.type.charAt(0).toUpperCase() + act.type.slice(1)}
                  </div>
                  <div className="activity-text">
                    <p>{act.text}</p>
                    <span>{act.subtext} • {getRelativeTime(act.created_at)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="activity-item" style={{ justifyContent: 'center', padding: '20px 0', color: '#64748b' }}>
                No recent activities found
              </div>
            )}
          </div>
        </div>

        <div className="quick-stats-card">
          <h2>Lifecycle Conversion</h2>
          <div className="line">
            <div>
              <div className="status-line" >
                <span>Qualified Leads</span>
                <span>{conversion.totalBaseline > 0 ? `${conversion.qualifiedLeadsCount} / ${conversion.totalBaseline} (${conversion.qualifiedPercentage}%)` : "0 / 0 (0%)"}</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${conversion.qualifiedPercentage}%`, height: '100%', background: '#4f46e5' }}></div>
              </div>
            </div>
            <div>
              <div className="status-line">
                <span>Converted Deals</span>
                <span>{conversion.totalBaseline > 0 ? `${conversion.wonDealsCount} / ${conversion.totalBaseline} (${conversion.convertedPercentage}%)` : "0 / 0 (0%)"}</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${conversion.convertedPercentage}%`, height: '100%', background: '#4f46e5' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;