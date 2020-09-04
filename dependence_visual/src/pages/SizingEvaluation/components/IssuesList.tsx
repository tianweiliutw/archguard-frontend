import React, { useState } from "react";
import { PagerTable } from "@/components/PagerTable/PagerTable";
import { IssuesConfig } from './IssuesConfig.config';
import "./IssuesList.less";

interface IssuesListProps {
  issuesConfig: IssuesConfig;
}

const IssuesList = (props: IssuesListProps) => {
  const { title, badSmellDescription, suggestion, tableConfigs } = props.issuesConfig;
  const [count, setCount] = useState(0);

  return (
    <div className="issues-list">
      <div className="issues-list-header x-between">
        <span className="issues-list-title">{title}</span>
        <span className={`issues-list-count ${count ? "red" : "green"}`}>{count}</span>
      </div>
      <div className="issues-list-content">
        <div className="issues-desc">
          <span>坏味道描述：</span>
          <span>{badSmellDescription}</span>
        </div>
        <div className="issues-suggest">
          <span>改进建议：</span>
          <span>{suggestion}</span>
        </div>
        { tableConfigs.map((tableConfig) => (
        <div className="issues-table">
          <div className="issues-table-title">
            { tableConfig.title }
          </div>
          <PagerTable
            change={(count) => { setCount(count) }}
            columns={tableConfig.columns}
            url={tableConfig.dataUrl}
          />
        </div>
        )) }
      </div>
    </div>
  );
};

export default IssuesList;