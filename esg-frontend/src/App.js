import React, { useEffect, useState } from "react";
import {
  Table, Spin, Alert, Typography, Form, Input, Button, DatePicker, Select,
  message, InputNumber, Switch, Popconfirm, notification, Card, Row, Col, Statistic
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import "antd/dist/reset.css";
import "./App.css";
import { Calendar, Timeline, Badge } from "antd";


const { Title } = Typography;
const { Option } = Select;

function App() {
  // State
  const [companies, setCompanies] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buLoading, setBuLoading] = useState(true);
  const [metricLoading, setMetricLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditLog, setAuditLog] = useState([]);

  // Helper to add audit log entry
  const addAuditLog = (action, details) => {
    setAuditLog(prev => [
      {
        timestamp: new Date().toLocaleString(),
        action,
        details,
      },
      ...prev,
    ]);
  };

  // Fetch data on mount
  useEffect(() => {
    fetchCompanies();
    fetchBusinessUnits();
    fetchMetrics();
  }, []);

  const fetchCompanies = () => {
    setLoading(true);
    axios.get("http://127.0.0.1:8000/api/companies/")
      .then((res) => {
        setCompanies(Array.isArray(res.data) ? res.data : res.data.results || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch companies");
        setLoading(false);
      });
  };

  const fetchBusinessUnits = () => {
    setBuLoading(true);
    axios.get("http://127.0.0.1:8000/api/business-units/")
      .then((res) => {
        setBusinessUnits(Array.isArray(res.data) ? res.data : res.data.results || []);
        setBuLoading(false);
      });
  };

  const fetchMetrics = () => {
    setMetricLoading(true);
    axios.get("http://127.0.0.1:8000/api/metrics/")
      .then((res) => {
        setMetrics(Array.isArray(res.data) ? res.data : res.data.results || []);
        setMetricLoading(false);
      });
  };

  // Company form submit
  const onCompanyFinish = (values) => {
    const payload = {
      ...values,
      reporting_period_start: values.reporting_period_start.format("YYYY-MM-DD"),
      reporting_period_end: values.reporting_period_end.format("YYYY-MM-DD"),
    };
    axios
      .post("http://127.0.0.1:8000/api/companies/", payload)
      .then(() => {
        notification.success({
          message: "Company Added",
          description: "A new company has been successfully added.",
          placement: "topRight",
          duration: 3,
        });
        addAuditLog("Added Company", values.name);
        fetchCompanies();
      })
      .catch(() => {
        notification.error({
          message: "Failed to Add Company",
          description: "Please check your input and try again.",
          placement: "topRight",
          duration: 3,
        });
      });
  };

  // Business Unit form submit
  const onBusinessUnitFinish = (values) => {
    const payload = {
      ...values,
      is_active: values.is_active || false,
    };
    axios
      .post("http://127.0.0.1:8000/api/business-units/", payload)
      .then(() => {
        notification.success({
          message: "Business Unit Added",
          description: "A new business unit has been successfully added.",
          placement: "topRight",
          duration: 3,
        });
        addAuditLog("Added Business Unit", values.name);
        fetchBusinessUnits();
      })
      .catch(() => {
        notification.error({
          message: "Failed to Add Business Unit",
          description: "Please check your input and try again.",
          placement: "topRight",
          duration: 3,
        });
      });
  };

  // Metric form submit
  const onMetricFinish = (values) => {
    const payload = {
      ...values,
      business_unit: values.business_unit,
      value: Number(values.value),
      reporting_year: Number(values.reporting_year),
      is_verified: values.is_verified || false,
    };
    axios
      .post("http://127.0.0.1:8000/api/metrics/", payload)
      .then(() => {
        notification.success({
          message: "Metric Added",
          description: "A new metric has been successfully added.",
          placement: "topRight",
          duration: 3,
        });
        addAuditLog("Added Metric", values.name);
        fetchMetrics();
      })
      .catch(() => {
        notification.error({
          message: "Failed to Add Metric",
          description: "Please check your input and try again.",
          placement: "topRight",
          duration: 3,
        });
      });
  };

  // Delete handlers
  const handleDeleteCompany = (id) => {
    const company = companies.find(c => c.id === id);
    axios.delete(`http://127.0.0.1:8000/api/companies/${id}/`)
      .then(() => {
        message.success("Company deleted!");
        addAuditLog("Deleted Company", company ? company.name : `ID ${id}`);
        fetchCompanies();
      })
      .catch(() => {
        notification.error({ message: "Error", description: "Failed to delete company." });
      });
  };

  const handleDeleteBusinessUnit = (id) => {
    const bu = businessUnits.find(bu => bu.id === id);
    axios.delete(`http://127.0.0.1:8000/api/business-units/${id}/`)
      .then(() => {
        message.success("Business Unit deleted!");
        addAuditLog("Deleted Business Unit", bu ? bu.name : `ID ${id}`);
        fetchBusinessUnits();
      })
      .catch(() => {
        notification.error({ message: "Error", description: "Failed to delete business unit." });
      });
  };

  const handleDeleteMetric = (id) => {
    const metric = metrics.find(m => m.id === id);
    axios.delete(`http://127.0.0.1:8000/api/metrics/${id}/`)
      .then(() => {
        message.success("Metric deleted!");
        addAuditLog("Deleted Metric", metric ? metric.name : `ID ${id}`);
        fetchMetrics();
      })
      .catch(() => {
        notification.error({ message: "Error", description: "Failed to delete metric." });
      });
  };

  // Choices from model
  const sectorOptions = [
    "TECHNOLOGY", "HEALTHCARE", "FINANCE", "ENERGY", "MANUFACTURING",
    "RETAIL", "AGRICULTURE", "TRANSPORTATION", "REAL_ESTATE", "UTILITIES", "OTHER"
  ];

  const unitTypeOptions = [
    "DEPARTMENT", "DIVISION", "SUBSIDIARY", "BRANCH", "FACILITY", "REGION", "OTHER"
  ];

  const esgCategoryOptions = [
    "ENVIRONMENTAL", "SOCIAL", "GOVERNANCE"
  ];

  const unitOptions = [
    "KWH", "TONNES", "LITERS", "HOURS", "PERCENTAGE", "COUNT", "RATIO", "CURRENCY", "OTHER"
  ];

  // Table columns with Delete Action
  const companyColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Sector", dataIndex: "sector", key: "sector" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Reporting Start", dataIndex: "reporting_period_start", key: "reporting_period_start" },
    { title: "Reporting End", dataIndex: "reporting_period_end", key: "reporting_period_end" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete company?"
          onConfirm={() => handleDeleteCompany(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" danger className="delete-btn">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const buColumns = [
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      render: (id) => {
        const c = companies.find(c => c.id === id);
        return c ? c.name : id;
      }
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "unit_type", key: "unit_type" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Active", dataIndex: "is_active", key: "is_active", render: v => v ? "Yes" : "No" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete business unit?"
          onConfirm={() => handleDeleteBusinessUnit(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" danger className="delete-btn">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const metricColumns = [
    {
      title: "Business Unit",
      dataIndex: "business_unit",
      key: "business_unit",
      render: (id) => {
        const bu = businessUnits.find(bu => bu.id === id);
        return bu ? `${bu.name} (${companies.find(c => c.id === bu.company)?.name || ""})` : id;
      }
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "esg_category", key: "esg_category" },
    { title: "Type", dataIndex: "metric_type", key: "metric_type" },
    { title: "Unit", dataIndex: "unit_of_measurement", key: "unit_of_measurement" },
    { title: "Value", dataIndex: "value", key: "value" },
    { title: "Year", dataIndex: "reporting_year", key: "reporting_year" },
    { title: "Period", dataIndex: "reporting_period", key: "reporting_period" },
    { title: "Verified", dataIndex: "is_verified", key: "is_verified", render: v => v ? "Yes" : "No" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Data Source", dataIndex: "data_source", key: "data_source" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete metric?"
          onConfirm={() => handleDeleteMetric(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" danger className="delete-btn">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="header-bar">
        <Title className="header-title" level={2}>ESG APP</Title>
      </div>

      {/* Dashboard Overview */}
      <div style={{ margin: "32px 0" }}>
        <Row gutter={24} justify="center">
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px #43cea220" }}>
              <Statistic
                title="Total Companies"
                value={companies.length}
                valueStyle={{ color: "#185a9d", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px #43cea220" }}>
              <Statistic
                title="Business Units"
                value={businessUnits.length}
                valueStyle={{ color: "#43cea2", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px #43cea220" }}>
              <Statistic
                title="Total Metrics"
                value={metrics.length}
                valueStyle={{ color: "#f59e42", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px #43cea220" }}>
              <Statistic
                title="Verified Metrics"
                value={metrics.filter(m => m.is_verified).length}
                valueStyle={{ color: "#52c41a", fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>
      </div>

     <div className="calendar-deadline-row" style={{ display: "flex", gap: 32, maxWidth: 1300, margin: "40px auto" }}>
  {/* Calendar on the left */}
  <div style={{ flex: 2 }}>
    <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px #43cea220" }}>
      <Title level={4} style={{ color: "#185a9d" }}>Reporting Periods Calendar</Title>
      <Calendar
        fullscreen={false}
        dateCellRender={date => {
          const formatted = date.format("YYYY-MM-DD");
          const starts = companies.filter(c => c.reporting_period_start === formatted);
          const ends = companies.filter(c => c.reporting_period_end === formatted);
          return (
            <>
              {starts.map(c => (
                <Badge key={c.id + "-start"} status="success" text={`Start: ${c.name}`} />
              ))}
              {ends.map(c => (
                <Badge key={c.id + "-end"} status="error" text={`End: ${c.name}`} />
              ))}
            </>
          );
        }}
      />
    </Card>
  </div>
  {/* Reporting Deadlines Card on the right */}
  <div style={{ flex: 1, minWidth: 320 }}>
    <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px #43cea220", minHeight: 200 }}>
      <Title level={4} style={{ color: "#faad14" }}>Reporting Deadlines</Title>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 340, overflowY: "auto" }}>
        {companies.length === 0 && <li>No companies found.</li>}
        {companies
          .sort((a, b) => new Date(a.reporting_period_end) - new Date(b.reporting_period_end))
          .map(c => (
            <li key={c.id} style={{ marginBottom: 12, display: "flex", alignItems: "center" }}>
              <Badge color="#faad14" />
              <span style={{ marginLeft: 8, color: "#185a9d", fontWeight: 600 }}>{c.name}</span>
              <span style={{ marginLeft: "auto", color: "#d48806", fontWeight: 500 }}>
                {c.reporting_period_end}
              </span>
            </li>
          ))}
      </ul>
    </Card>
  </div>
</div>



      {/* Company Section */}
      <div className="section-row">
        <div className="section-col company-form-card">
          <Title level={4} style={{ marginBottom: 16, color: "#43cea2" }}>
            <PlusOutlined style={{ color: "#185a9d", marginRight: 8 }} />
            Add New Company
          </Title>
          <Form layout="vertical" onFinish={onCompanyFinish}>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter company name" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Sector" name="sector" rules={[{ required: true, message: "Please select sector" }]}>
              <Select placeholder="Select sector">
                {sectorOptions.map(opt => (
                  <Option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase().replace('_', ' ')}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Location" name="location" rules={[{ required: true, message: "Please enter location" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Reporting Period Start" name="reporting_period_start" rules={[{ required: true, message: "Please select start date" }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Reporting Period End" name="reporting_period_end" rules={[{ required: true, message: "Please select end date" }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="stylish-btn"
                icon={<PlusOutlined />}
                size="large"
              >
                Add Company
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className="section-col">
          <Title level={4} style={{ textAlign: "center" }}>Companies</Title>
          {error && <Alert message={error} type="error" showIcon />}
          {loading ? (
            <Spin />
          ) : (
            <Table
              columns={companyColumns}
              dataSource={companies}
              rowKey="id"
              bordered
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      </div>

      {/* Business Unit Section */}
      <div className="section-row">
        <div className="section-col businessunit-form-card">
          <Title level={4} style={{ marginBottom: 16, color: "#43cea2" }}>
            <PlusOutlined style={{ color: "#185a9d", marginRight: 8 }} />
            Add New Business Unit
          </Title>
          <Form layout="vertical" onFinish={onBusinessUnitFinish}>
            <Form.Item label="Company" name="company" rules={[{ required: true, message: "Select company" }]}>
              <Select placeholder="Select company">
                {companies.map(c => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "Enter business unit name" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Unit Type" name="unit_type" rules={[{ required: true, message: "Select unit type" }]}>
              <Select placeholder="Select unit type">
                {unitTypeOptions.map(opt => (
                  <Option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Location" name="location" rules={[{ required: true, message: "Enter location" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Is Active" name="is_active" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="stylish-btn"
                icon={<PlusOutlined />}
                size="large"
              >
                Add Business Unit
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className="section-col">
          <Title level={4} style={{ textAlign: "center" }}>Business Units</Title>
          {buLoading ? (
            <Spin />
          ) : (
            <Table
              columns={buColumns}
              dataSource={businessUnits}
              rowKey="id"
              bordered
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      </div>

      {/* Metric Section */}
      <div className="section-row">
        <div className="section-col metric-form-card">
          <Title level={4} style={{ marginBottom: 16, color: "#185a9d" }}>
            <PlusOutlined style={{ color: "#43cea2", marginRight: 8 }} />
            Add New Metric
          </Title>
          <Form layout="vertical" onFinish={onMetricFinish}>
            <Form.Item label="Business Unit" name="business_unit" rules={[{ required: true, message: "Select business unit" }]}>
              <Select placeholder="Select business unit">
                {businessUnits.map(bu => (
                  <Option key={bu.id} value={bu.id}>
                    {bu.name} ({companies.find(c => c.id === bu.company)?.name || ""})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "Enter metric name" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="ESG Category" name="esg_category" rules={[{ required: true, message: "Select ESG category" }]}>
              <Select placeholder="Select ESG category">
                {esgCategoryOptions.map(opt => (
                  <Option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Metric Type" name="metric_type" rules={[{ required: true, message: "Enter metric type" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Unit of Measurement" name="unit_of_measurement" rules={[{ required: true, message: "Select unit" }]}>
              <Select placeholder="Select unit">
                {unitOptions.map(opt => (
                  <Option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Value" name="value" rules={[{ required: true, message: "Enter value" }]}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Reporting Year" name="reporting_year" rules={[{ required: true, message: "Enter reporting year" }]}>
              <InputNumber min={2000} max={2100} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Reporting Period" name="reporting_period" initialValue="ANNUAL">
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Data Source" name="data_source">
              <Input />
            </Form.Item>
            <Form.Item label="Is Verified" name="is_verified" valuePropName="checked">
              <Switch checkedChildren="Verified" unCheckedChildren="Not Verified" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="stylish-btn"
                icon={<PlusOutlined />}
                size="large"
              >
                Add Metric
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className="section-col">
          <Title level={4} style={{ textAlign: "center" }}>Metrics</Title>
          {metricLoading ? (
            <Spin />
          ) : (
            <Table
              columns={metricColumns}
              dataSource={metrics}
              rowKey="id"
              bordered
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          )}
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="audit-log-card" style={{
        maxWidth: 700, margin: "32px auto", background: "#fffbe6", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px #ffd66640"
      }}>
        <Title level={4} style={{ color: "#d48806" }}>Audit Log / History</Title>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {auditLog.length === 0 && <li>No activity yet.</li>}
          {auditLog.map((log, idx) => (
            <li key={idx} style={{ marginBottom: 12 }}>
              <span style={{ color: "#8c8c8c", fontSize: 12 }}>{log.timestamp}</span>
              <br />
              <b>{log.action}</b>: {log.details}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
  
}

export default App;
