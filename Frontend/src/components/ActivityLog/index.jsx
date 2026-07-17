import "./ActivityLog.styles.css";

const ActivityLog = ({ activities = [] }) => {
  return (
    <div className="activity-container">
      <h3 className="activity-title">System Activity Trail Audit</h3>
      <div className="activity-pipeline">
        {activities.map((act, index) => (
          <div key={index} className="activity-event-node">
            <p className="activity-node-message">{act}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;