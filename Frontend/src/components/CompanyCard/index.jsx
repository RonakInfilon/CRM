import "./CompanyCard.styles.css";
import ActionMenu from "../ActionMenu";

const CompanyCard = ({ company, onDelete, onEditClick, onViewClick }) => {
  const firstLatter = company?.organization_name
    ? company.organization_name.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="Company-Card" onClick={onViewClick}>
      <div className="card-header">
        <div className="company-info-main">
          <div className="company-logo">{firstLatter}</div>
          <div>
            <h3 className="company-name">
              {company.organization_name || "Unknown Company"}
            </h3>
            <p className="company-sub-industry">{company.industry || "N/A"}</p>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <ActionMenu
            data={company}
            dataId={company.org_id}
            onEdit={onEditClick}
            onDelete={onDelete}
          />
        </div>
      </div>
      <div className="card-body">
        <div className="info-row">
          <div className="info-block">
            <span className="info-label">Industry</span>
            <span className="info-value">{company.industry || "-"}</span>
          </div>
          <div className="info-block">
            <span className="info-label">Annual Revenue</span>
            <span className="info-value">
              {company.annual_revenue
                ? `$${Number(company.annual_revenue).toLocaleString()}`
                : "-"}
            </span>
          </div>
        </div>
        <div className="info-row">
          <div className="info-block">
            <span className="info-label">Phone No</span>
            <span className="range-badge">{company.phone || "-"}</span>
          </div>
          <div className="info-block">
            <span className="info-label">Location</span>
            <span className="info-value">
              {company.location ||
                (company.city && company.country
                  ? `${company.city}, ${company.country}`
                  : company.country || "-")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;