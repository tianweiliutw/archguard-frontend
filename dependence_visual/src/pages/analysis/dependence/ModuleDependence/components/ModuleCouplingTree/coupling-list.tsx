import { exportJsonToExcel } from "@/utils/file-utils";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Table, Tooltip } from "antd";
import { SortOrder } from "antd/lib/table/interface";
import React, { useMemo } from "react";
import "./list.less";

export interface CouplingRecord {
  key: string;
  label: string;
  name: string;
  shortName?: string;
  props: {
    desc: string;
    name: string;
    value: any;
    key: string;
  }[];
  list?: CouplingRecord[];
}

interface CouplingListProps {
  data?: CouplingRecord[];
  style?: React.CSSProperties;
  exportable?: boolean;
}

export default function CouplingList(props: CouplingListProps) {
  const { data = [], style, exportable = false } = props;

  const columns = useMemo(() => {
    const firstItem = data[0];
    if (firstItem) {
      const props = firstItem.props.map((prop, index) => {
        return {
          title: (
            <Tooltip title={prop.desc}>
              <div>
                {prop.name} <QuestionCircleOutlined />
              </div>
            </Tooltip>
          ),
          sortDirections: ["descend", "ascend"] as SortOrder[],
          sorter(a: CouplingRecord, b: CouplingRecord) {
            return a.props[index].value - b.props[index].value;
          },
          render(_: any, item: CouplingRecord) {
            const value = item.props[index].value;
            return value;
          },
        };
      });
      return [
        {
          title: firstItem.label,
          render(_: any, item: CouplingRecord) {
            const value = item.shortName ?? item.name;
            return (
              <Tooltip title={item.name}>
                <div>{value}</div>
              </Tooltip>
            );
          },
        },
        ...props,
      ];
    }
    return [];
  }, [data]);

  const exportExcel = () => {
    exportJsonToExcel(
      data.map((record) => {
        const props: { [key: string]: any } = {};
        record.props.forEach((p) => (props[p.key] = p.value));
        return { name: record.name, ...props };
      }),
      `coupling_${Date.now()}.xlsx`,
    );
  };

  return (
    <Table
      className="coupling-list"
      style={style}
      title={
        exportable
          ? () => {
              return (
                <div style={{ textAlign: "right" }}>
                  <Button onClick={() => exportExcel()}>导出到Excel</Button>
                </div>
              );
            }
          : undefined
      }
      dataSource={data}
      showSorterTooltip={false}
      scroll={{ x: true }}
      columns={columns}
      bordered
      size="small"
      pagination={{ position: ["bottomCenter"], hideOnSinglePage: true }}
      expandable={{
        expandRowByClick: true,
        expandedRowRender: (record) => (
          <div className="nested-list">
            <CouplingList style={{ margin: 0 }} data={record.list} />
          </div>
        ),
        rowExpandable: (record) => {
          return record.list ? record.list.length > 0 : false;
        },
      }}
    />
  );
}
