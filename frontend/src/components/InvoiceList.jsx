import React, { useEffect, useState } from "react";
import InvoiceForm from "./InvoiceForm";

const INVOICE_API = "http://localhost:5001/api/invoices";
const CLIENT_API = "http://localhost:5001/api/clients";
const PROJECT_API = "http://localhost:5001/api/projects";

function InvoiceList() {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [clientFilter, setClientFilter] = useState("");
    const [projectFilter, setProjectFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);

    const token = localStorage.getItem("token");

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (search) {
                params.append("search", search);
            }

            if (clientFilter) {
                params.append("client", clientFilter);
            }

            if (projectFilter) {
                params.append("project", projectFilter);
            }

            if (statusFilter) {
                params.append("status", statusFilter);
            }

            const url = params.toString()
                ? `${INVOICE_API}?${params.toString()}`
                : INVOICE_API;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch invoices"
                );
            }

            setInvoices(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetch(CLIENT_API, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setClients(data.clients || data);
            }
        } catch (error) {
            console.log("Failed to fetch clients:", error.message);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch(PROJECT_API, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setProjects(data.projects || data);
            }
        } catch (error) {
            console.log("Failed to fetch projects:", error.message);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchProjects();
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [search, clientFilter, projectFilter, statusFilter]);

    const clearFilters = () => {
        setSearch("");
        setClientFilter("");
        setProjectFilter("");
        setStatusFilter("");
    };

    const totalInvoices = invoices.length;

    const draftInvoices = invoices.filter(
        (invoice) => invoice.status === "Draft"
    ).length;

    const sentInvoices = invoices.filter(
        (invoice) => invoice.status === "Sent"
    ).length;

    const paidInvoices = invoices.filter(
        (invoice) => invoice.status === "Paid"
    ).length;

    const overdueInvoices = invoices.filter(
        (invoice) => invoice.status === "Overdue"
    ).length;

    const getStatusStyle = (status) => {
        switch (status) {
            case "Draft":
                return "bg-gray-100 text-gray-700";

            case "Sent":
                return "bg-blue-100 text-blue-700";

            case "Paid":
                return "bg-green-100 text-green-700";

            case "Overdue":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const handleEdit = (invoice) => {
        setEditingInvoice(invoice);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const handleDelete = async (invoiceId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this invoice?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5001/api/invoices/${invoiceId}`,
                {
                    method: "DELETE",
                    headers: {

                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete invoice");
            }


            setInvoices((prevInvoices) =>
                prevInvoices.filter((invoice) => invoice._id !== invoiceId)
            );


            if (selectedInvoice && selectedInvoice._id === invoiceId) {
                setSelectedInvoice(null);
            }

            alert("Invoice deleted successfully!");
        } catch (error) {
            console.error("Delete invoice error:", error);
            alert(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">

                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Invoice Management
                    </h1>

                    <p className="text-gray-500 mt-1">
                        View and manage your invoices
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditingInvoice(null);
                        setShowForm(true);
                    }}
                    className="w-full md:w-auto bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                >
                    + Create Invoice
                </button>

            </div>
            {/* Invoice Form */}
            {showForm && (
                <div className="mb-6">
                    <InvoiceForm
                        invoice={editingInvoice}
                        onSuccess={() => {
                            setShowForm(false);
                            setEditingInvoice(null);
                            fetchInvoices();
                        }}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingInvoice(null);
                        }}
                    />
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-gray-500 text-sm">
                        Total Invoices
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-2">
                        {totalInvoices}
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-gray-500 text-sm">
                        Draft
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-2">
                        {draftInvoices}
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-gray-500 text-sm">
                        Sent
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-2">
                        {sentInvoices}
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-gray-500 text-sm">
                        Paid
                    </p>

                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        {paidInvoices}
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-gray-500 text-sm">
                        Overdue
                    </p>

                    <h2 className="text-2xl font-bold text-red-600 mt-2">
                        {overdueInvoices}
                    </h2>
                </div>

            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">

                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Search & Filter Invoices
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Invoice Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Invoice Number
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search invoice..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Client Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client
                        </label>

                        <select
                            value={clientFilter}
                            onChange={(e) =>
                                setClientFilter(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                        >
                            <option value="">
                                All Clients
                            </option>

                            {clients.map((client) => (
                                <option
                                    key={client._id}
                                    value={client._id}
                                >
                                    {client.name ||
                                        client.companyName ||
                                        client.username ||
                                        "Unnamed Client"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Project Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project
                        </label>

                        <select
                            value={projectFilter}
                            onChange={(e) =>
                                setProjectFilter(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                        >
                            <option value="">
                                All Projects
                            </option>

                            {projects.map((project) => (
                                <option
                                    key={project._id}
                                    value={project._id}
                                >
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                        >
                            <option value="">
                                All Statuses
                            </option>

                            <option value="Draft">
                                Draft
                            </option>

                            <option value="Sent">
                                Sent
                            </option>

                            <option value="Paid">
                                Paid
                            </option>

                            <option value="Overdue">
                                Overdue
                            </option>
                        </select>
                    </div>

                </div>

                {/* Clear Filters */}
                <div className="mt-4">
                    <button
                        onClick={clearFilters}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Clear all filters
                    </button>
                </div>

            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-6">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                    <p className="text-gray-500">
                        Loading invoices...
                    </p>
                </div>
            )}

            {/* Invoice Table */}
            {!loading && !error && invoices.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto">

                    <table className="w-full min-w-[1000px] text-left">

                        <thead className="bg-gray-50 border-b border-gray-200">

                            <tr>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Invoice
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Client
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Project
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Issue Date
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Due Date
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">
                                    Total
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-center">
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody className="divide-y divide-gray-100">

                            {invoices.map((invoice) => (

                                <tr
                                    key={invoice._id}
                                    className="hover:bg-blue-50/40 transition duration-150"
                                >

                                    {/* Invoice */}

                                    <td className="px-6 py-5">

                                        <span className="font-semibold text-blue-600">
                                            {invoice.invoiceNumber}
                                        </span>

                                    </td>


                                    {/* Client */}

                                    <td className="px-6 py-5 text-gray-700">

                                        {invoice.client?.name ||
                                            invoice.client?.companyName ||
                                            invoice.client?.username ||
                                            "N/A"}

                                    </td>


                                    {/* Project */}

                                    <td className="px-6 py-5 text-gray-700">

                                        {invoice.project?.name || "N/A"}

                                    </td>


                                    {/* Issue Date */}

                                    <td className="px-6 py-5 text-gray-600">

                                        {invoice.issueDate
                                            ? new Date(
                                                invoice.issueDate
                                            ).toLocaleDateString()
                                            : "N/A"}

                                    </td>


                                    {/* Due Date */}

                                    <td className="px-6 py-5 text-gray-600">

                                        {invoice.dueDate
                                            ? new Date(
                                                invoice.dueDate
                                            ).toLocaleDateString()
                                            : "N/A"}

                                    </td>


                                    {/* Total */}

                                    <td className="px-6 py-5 text-right">

                                        <span className="font-bold text-gray-900">
                                            {Number(invoice.totalAmount).toLocaleString()}
                                        </span>

                                    </td>


                                    {/* Status */}

                                    <td className="px-6 py-5">

                                        <span
                                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(
                                                invoice.status
                                            )}`}
                                        >
                                            {invoice.status}
                                        </span>

                                    </td>


                                    {/* Action */}
                                    {/* Action */}
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* View Button (Blue) */}
                                            <button
                                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition duration-150 shadow-sm"
                                                onClick={() => setSelectedInvoice(invoice)}
                                            >
                                                View
                                            </button>

                                            {/* Edit Button (Green) */}
                                            <button
                                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:bg-green-800 transition duration-150 shadow-sm"
                                                onClick={() => handleEdit(invoice)}
                                            >
                                                Edit
                                            </button>

                                            {/* Delete Button (Red) */}
                                            <button
                                                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:bg-red-800 transition duration-150 shadow-sm"
                                                onClick={() => handleDelete(invoice._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>
            )}

            {/* Empty State */}
            {!loading && !error && invoices.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">

                    <h3 className="text-xl font-semibold text-gray-700">
                        No invoices found
                    </h3>

                    <p className="text-gray-500 mt-2">
                        No invoices are available or match your filters.
                    </p>

                    <button
                        onClick={clearFilters}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Clear filters
                    </button>

                </div>
            )}
            {selectedInvoice && (
                <div className="invoice-overlay">

                    <div className="invoice-details">


                        {/* Header */}
                        <div className="invoice-header">

                            <div>
                                <h2>INVOICE</h2>

                                <p className="invoice-number">
                                    Invoice Number:{" "}
                                    <strong>{selectedInvoice.invoiceNumber}</strong>
                                </p>
                            </div>

                            <span className="invoice-status">
                                {selectedInvoice.status}
                            </span>

                        </div>


                        {/* Information */}
                        <div className="invoice-info">

                            <div>
                                <h3>Billed To</h3>

                                <p>
                                    <strong>Client:</strong>{" "}
                                    {selectedInvoice.client?.name ||
                                        selectedInvoice.client?.username ||
                                        "N/A"}
                                </p>

                                <p>
                                    <strong>Project:</strong>{" "}
                                    {selectedInvoice.project?.name || "N/A"}
                                </p>
                            </div>


                            <div>
                                <h3>Invoice Information</h3>

                                <p>
                                    <strong>Issue Date:</strong>{" "}
                                    {new Date(
                                        selectedInvoice.issueDate
                                    ).toLocaleDateString()}
                                </p>

                                <p>
                                    <strong>Due Date:</strong>{" "}
                                    {new Date(
                                        selectedInvoice.dueDate
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                        </div>


                        {/* Invoice Items */}
                        <h3>Invoice Items / Services</h3>

                        <table className="invoice-items">

                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>

                            <tbody>

                                {selectedInvoice.items.map((item, index) => (

                                    <tr key={index}>

                                        <td>
                                            {item.description}
                                        </td>

                                        <td>
                                            {item.quantity}
                                        </td>

                                        <td>
                                            {Number(item.unitPrice).toLocaleString()}
                                        </td>

                                        <td>
                                            {Number(item.total).toLocaleString()}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>


                        {/* Totals */}
                        <div className="invoice-totals">

                            <p>
                                <span>Subtotal</span>

                                <span>
                                    {Number(
                                        selectedInvoice.subtotal
                                    ).toLocaleString()}
                                </span>
                            </p>


                            <p className="invoice-total">

                                <span>Total</span>

                                <span>
                                    {Number(
                                        selectedInvoice.totalAmount
                                    ).toLocaleString()}
                                </span>

                            </p>

                        </div>
                        <div className="invoice-actions">



                            <button
                                className="print-button"
                                onClick={() => window.print()}
                            >
                                🖨 Print / Save as PDF
                            </button>



                            <button
                                className="close-button"
                                onClick={() => setSelectedInvoice(null)}
                            >
                                Close
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default InvoiceList;