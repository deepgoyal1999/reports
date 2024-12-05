import React, { useState, useEffect } from "react";
import { Select, Button, Table, Input, DatePicker, Modal, Row, Col, Card, Tooltip,message } from "antd";
import { DownloadOutlined, BarChartOutlined } from "@ant-design/icons";
import data from "../dummy.json";

const { Option } = Select;
const { RangePicker } = DatePicker;

const metricsObj = {
  masterOID: "Master-O ID",
  contentLaunchDate: "Content launch date",
  challangeStatus: "Challenges Status",
  completeStatus: "Completion Status",
  completeDate: "Completion Date",
  completeinDays: "Completed In Days",
  attempts: "Attempts",
  score: "Score",
  maxScore: "Max Score",
  timeSpent: "Time Spent",
  microSkill: "Microskill Name",
  loginStatus: "Login Status",
  llDate: "Last Login Date",
};

const metrics = {
  [metricsObj.masterOID]: ["Count", "Distinct Count", "Value"],
  [metricsObj.contentLaunchDate]: ["Date Range", "Specific Date"],
  [metricsObj.challangeStatus]: ["Status", "Count", "Percentage"],
  [metricsObj.completeStatus]: ["Less Than", "Greater Than", "Range"],
  [metricsObj.completeDate]: ["Date Range", "Specific Date"],
  [metricsObj.completeinDays]: ["Count", "Less Than", "Greater"],
  [metricsObj.attempts]: ["Status"],
  [metricsObj.score]: ["Count", "Average", "Percentage"],
  [metricsObj.maxScore]: ["Count"],
  [metricsObj.timeSpent]: ["Time Value", "Average"],
  [metricsObj.microSkill]: ["Count", "Distinct Count", "Value"],
  [metricsObj.loginStatus]: ["Status Count"],
  [metricsObj.llDate]: ["Date Range", "Specific Date"],
};

const CustomReports = () => {
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState(data);




  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [email, setEmail] = useState("");

  const handleMetricChange = (value) => {
    setSelectedMetrics(value);
    const newFilters = {};
    value.forEach((metric) => {
      newFilters[metric] = filters[metric] || [];
    });
    setFilters(newFilters);
  };

  const handleFilterChange = (metric, filterValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [metric]: filterValue,
    }));
  };

  useEffect(() => {
    const filtered = data.filter((item) => {
      return selectedMetrics.every((metric) => {
        const filterValue = filters[metric];
        if (!filterValue || filterValue.length === 0) return true;

        // Handle "Date Range" filters
        if (metric.includes("Date") && Array.isArray(filterValue)) {
          const [startDate, endDate] = filterValue;
          const itemDate = new Date(item[metric]);
          return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        }

        // Handle numeric filters
        if (typeof item[metric] === "number") {
          if (Array.isArray(filterValue) && filterValue.length === 2) {
            const [min, max] = filterValue;
            return item[metric] >= min && item[metric] <= max;
          } else if (typeof filterValue === "string" && filterValue.startsWith("<")) {
            const max = parseFloat(filterValue.slice(1));
            return item[metric] < max;
          } else if (typeof filterValue === "string" && filterValue.startsWith(">")) {
            const min = parseFloat(filterValue.slice(1));
            return item[metric] > min;
          } else {
            return item[metric] === parseFloat(filterValue);
          }
        }

        // Handle text or other filters
        return item[metric] === filterValue;
      });
    });
    setFilteredData(filtered);
  }, [filters, selectedMetrics]);

  const sendEmail = async () => {
    if (!email) {
      message.error("Please enter a valid email address.");
      return;
    }

    try {
      // Mocking the email API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Email sent successfully!");
      setIsEmailModalVisible(false);
    } catch (error) {
      message.error("Failed to send email. Please try again.");
    }
  };

  const generateReport = () => {
    const csvData = filteredData
      .map((item) =>
        selectedMetrics
          .map((metric) => `"${item[metric] || "N/A"}"`)
          .join(",")
      )
      .join("\n");

    const headers = selectedMetrics.map((metric) => `"${metric}"`).join(",");
    const csvContent = [headers, csvData].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "custom_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFilter = (metric) => {
    if (metrics[metric].includes("Date Range")) {
      return (
        <RangePicker
          onChange={(dates, dateStrings) => handleFilterChange(metric, dateStrings)}
        />
      );
    }
    if (metrics[metric].includes("Specific Date")) {
      return (
        <DatePicker
          onChange={(date, dateString) => handleFilterChange(metric, dateString)}
        />
      );
    }
    if (typeof data[0][metric] === "number") {
      return (
        <Input
          placeholder={`Enter filter for ${metric} (e.g., <50, >30, 10-20)`}
          onChange={(e) => {
            const value = e.target.value;
            if (value.includes("-")) {
              const [min, max] = value.split("-").map((v) => parseFloat(v.trim()));
              handleFilterChange(metric, [min, max]);
            } else {
              handleFilterChange(metric, value.trim());
            }
          }}
        />
      );
    }
    if (metrics[metric].includes("Status")) {
      return (
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder={`Select ${metric} Status`}
          onChange={(value) => handleFilterChange(metric, value)}
        >
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
      );
    }
    return (
      <Input
        placeholder={`Enter filter for ${metric}`}
        onChange={(e) => handleFilterChange(metric, e.target.value)}
      />
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card>
        <h2 style={{ textAlign: "center" }}>Custom Reports</h2>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Select Metrics"
              onChange={handleMetricChange}
              value={selectedMetrics}
            >
              {Object.keys(metrics).map((metric) => (
                <Option key={metric} value={metric}>
                  {metric}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
          {selectedMetrics.map((metric) => (
            <Col span={8} key={metric}>
              <Tooltip title={`Filter for ${metric}`}>
                <h4>{metric}</h4>
                {renderFilter(metric)}
              </Tooltip>
            </Col>
          ))}
        </Row>

        <Row justify="center" style={{ marginTop: "20px" }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={generateReport}
            style={{ marginRight: "10px" }}
          >
            Export as CSV
          </Button>
          <Button
            type="primary"
            onClick={()=>setIsEmailModalVisible(true)}
            style={{ marginRight: "10px" }}
          >
            SendEmail
          </Button>
        </Row>
      </Card>

      <Card style={{ marginTop: "20px" }}>
      <Table
          dataSource={filteredData.map((item, index) => ({ ...item, key: index }))}
          columns={selectedMetrics.map((metric) => ({
            title: metric,
            dataIndex: metric,
            key: metric,
          }))}
        />
      </Card>

      <Modal
        title="Send Report via Email"
        visible={isEmailModalVisible}
        onOk={sendEmail}
        onCancel={() => setIsEmailModalVisible(false)}
        okText="Send"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter recipient's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Modal>

    </div>
  );
};

export default CustomReports;
