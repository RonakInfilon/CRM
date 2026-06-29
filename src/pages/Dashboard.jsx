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
import { useRole } from "../context/RoleContext";
import "../styles/dashboard.css";

function Dashboard() {
  const { isEmployee } = useRole();

  const stats = [
    {
      title: "Total Leads",
      value: "148",
      trend: "+12.5%",
      isPositive: true,
      icon: <Users size={22} />,
      type: "leads",
    },
    {
      title: "Active Pipeline",
      value: isEmployee ? "Restricted" : "$182,400",
      trend: isEmployee ? "Locked" : "+8.3%",
      isPositive: !isEmployee,
      icon: isEmployee ? <Lock size={22} /> : <DollarSign size={22} />,
      type: "pipeline",
    },
    {
      title: "Win Rate",
      value: "64.2%",
      trend: "-1.5%",
      isPositive: false,
      icon: <TrendingUp size={22} />,
      type: "winrate",
    },
    {
      title: "Companies",
      value: "38",
      trend: "+4 new",
      isPositive: true,
      icon: <Building size={22} />,
      type: "companies",
    },
  ];

  const leadGrowthConfig = {
    series: [
      {
        name: "New Leads",
        data: [35, 48, 62, 55, 78, 92],
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
        strokeDashArray: 4,
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
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
    series: [44, 25, 19, 12],
    options: {
      chart: {
        type: "donut",
      },
      labels: ["Website", "LinkedIn", "Referrals", "Cold outreach"],
      colors: ["#6366f1", "#06b6d4", "#f59e0b", "#ef4444"],
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
                formatter: () => "148",
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
          <div key={i} className="metric-card">
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
            <div className="activity-item">
              <div className="activity-badge deal">Deal</div>
              <div className="activity-text">
                <p>CRM Implementation Deal stage updated to <strong>Won</strong></p>
                <span>Google Account • By John Smith • 2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-badge lead">Lead</div>
              <div className="activity-text">
                <p>New Lead created: <strong>Anjali Sharma</strong></p>
                <span>Athletex Co • Inbound Cold Call • 4 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-badge org">Company</div>
              <div className="activity-text">
                <p>New Organization added: <strong>Infilon Technology</strong></p>
                <span>Ahmedabad branch • By Admin • 1 day ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-stats-card">
          <h2>Lifecycle Conversion</h2>
          <div className="line">
            <div>
              <div className="status-line" >
                <span>Qualified Leads</span>
                <span>84 / 148 (56%)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '56%', height: '100%', background: '#4f46e5' }}></div>
              </div>
            </div>
            <div>
              <div className="status-line">
                <span>Converted Deals</span>
                <span>24 / 84 (28%)</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '28%', height: '100%', background: '#4f46e5' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;