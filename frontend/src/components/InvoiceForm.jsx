import React, { useEffect, useState } from "react";

const CLIENT_API = "http://localhost:5001/api/clients";
const PROJECT_API = "http://localhost:5001/api/projects";
const INVOICE_API = "http://localhost:5001/api/invoices";

function InvoiceForm({ invoice, onSuccess, onCancel }) {
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);

    const [formData, setFormData] = useState({
        invoiceNumber: "",
        client: "",
        project: "",
        issueDate: "",
        dueDate: "",
        status: "Draft",
    });

    const [items, setItems] = useState([
        {
            description: "",
            quantity: "",
            unitPrice: ""
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    // Check whether we are editing an existing invoice
    const isEditing = Boolean(invoice);

    // Load clients and projects
    useEffect(() => {
        const loadData = async () => {
            try {
                setDataLoading(true);

                const [clientResponse, projectResponse] =
                    await Promise.all([
                        fetch(CLIENT_API, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),

                        fetch(PROJECT_API, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                    ]);

                const clientData = await clientResponse.json();
                const projectData = await projectResponse.json();

                if (!clientResponse.ok) {
                    throw new Error(
                        clientData.message || "Failed to load clients"
                    );
                }

                if (!projectResponse.ok) {
                    throw new Error(
                        projectData.message || "Failed to load projects"
                    );
                }

                setClients(clientData.clients || clientData);
                setProjects(projectData.projects || projectData);
            } catch (error) {
                setError(error.message);
            } finally {
                setDataLoading(false);
            }
        };

        loadData();
    }, []);

    // Load existing invoice when editing
    useEffect(() => {
        if (invoice) {
            setFormData({
                invoiceNumber: invoice.invoiceNumber || "",
                client: invoice.client?._id || invoice.client || "",
                project: invoice.project?._id || invoice.project || "",
                issueDate: invoice.issueDate
                    ? invoice.issueDate.substring(0, 10)
                    : "",
                dueDate: invoice.dueDate
                    ? invoice.dueDate.substring(0, 10)
                    : "",
                status: invoice.status || "Draft",
            });

            setItems(
                invoice.items?.map((item) => ({
                    description: item.description || "",
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 0,
                })) || []
            );
        }
    }, [invoice]);

    // Handle normal inputs
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

   // Handle invoice item changes
const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index][field] = value;

    setItems(updatedItems);
};

    // Add another item
    const addItem = () => {
        setItems([
            ...items,
           {
              description: "",
              quantity: "",
               unitPrice: ""
           }
        ]);
    };

    // Remove an item
    const removeItem = (index) => {
        if (items.length === 1) {
            return;
        }

        setItems(items.filter((_, itemIndex) => itemIndex !== index));
    };

    // Calculate total
    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            return (
                sum +
                Number(item.quantity || 0) *
                Number(item.unitPrice || 0)
            );
        }, 0);
    };

    // Form validation
    const validateForm = () => {
        if (!formData.invoiceNumber.trim()) {
            return "Invoice number is required.";
        }

        if (!formData.client) {
            return "Please select a client.";
        }

        if (!formData.project) {
            return "Please select a project.";
        }

        if (!formData.issueDate) {
            return "Issue date is required.";
        }

        if (!formData.dueDate) {
            return "Due date is required.";
        }

        if (
            new Date(formData.dueDate) <
            new Date(formData.issueDate)
        ) {
            return "Due date cannot be before issue date.";
        }

        if (items.length === 0) {
            return "Invoice must contain at least one item.";
        }

        for (const item of items) {
            if (!item.description.trim()) {
                return "Every invoice item needs a description.";
            }

            if (item.quantity < 1) {
                return "Quantity must be at least 1.";
            }

            if (item.unitPrice < 0) {
                return "Unit price cannot be negative.";
            }
        }

        return "";
    };

    // Submit invoice
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const invoiceData = {
                invoiceNumber: formData.invoiceNumber,
                client: formData.client,
                project: formData.project,
                issueDate: formData.issueDate,
                dueDate: formData.dueDate,
                status: formData.status,
                items,
            };

            const url = isEditing
                ? `${INVOICE_API}/${invoice._id}`
                : INVOICE_API;

            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(invoiceData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save invoice"
                );
            }

            if (onSuccess) {
                onSuccess(data);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <p className="text-gray-500">
                    Loading invoice form...
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-5 md:p-7">

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {isEditing ? "Edit Invoice" : "Create New Invoice"}
                </h2>

                <p className="text-gray-500 mt-1">
                    {isEditing
                        ? "Update invoice information"
                        : "Enter the invoice details below"}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* Invoice Information */}
                <div className="mb-8">

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Invoice Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Invoice Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Invoice Number *
                            </label>

                            <input
                                type="text"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleChange}
                                placeholder="INV-001"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                            />
                        </div>

                        {/* Client */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client *
                            </label>

                            <select
                                name="client"
                                value={formData.client}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                            >
                                <option value="">
                                    Select Client
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

                        {/* Project */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project *
                            </label>

                            <select
                                name="project"
                                value={formData.project}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                            >
                                <option value="">
                                    Select Project
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

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Sent">Sent</option>
                                <option value="Paid">Paid</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>

                        {/* Issue Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Issue Date *
                            </label>

                            <input
                                type="date"
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                            />
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date *
                            </label>

                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                            />
                        </div>

                    </div>
                </div>

                {/* Invoice Items */}
                <div className="mb-8">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                        <h3 className="text-lg font-semibold text-gray-800">
                            Invoice Items
                        </h3>

                        <button
                            type="button"
                            onClick={addItem}
                            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
                        >
                            + Add Item
                        </button>

                    </div>

                    <div className="space-y-4">

                        {items.map((item, index) => (

                            <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4"
                            >

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                                    {/* Description */}
                                    <div className="md:col-span-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>

                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Website Development"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantity
                                        </label>

                                       <input
                                       type="number"
                                       min="1"
                                       value={item.quantity ?? ""}
                                        onChange={(e) =>
                                         handleItemChange(index, "quantity", e.target.value)
                                          }
                                         placeholder="Enter quantity"
                                         className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                                      />
                                    </div>

                                    {/* Unit Price */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit Price
                                        </label>

                                     <input
                                      type="number"
                                      min="0"
                                     value={item.unitPrice ?? ""}
                                     onChange={(e) =>
                                       handleItemChange(index, "unitPrice", e.target.value)
                                      }
                                     placeholder="Enter unit price"
                                     className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                                   />
                                    </div>

                                    {/* Item Total */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Total
                                        </label>

                                        <div className="bg-gray-100 rounded-lg px-4 py-2.5">
                                            {(
                                                Number(item.quantity || 0) *
                                                Number(item.unitPrice || 0)
                                            ).toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Remove */}
                                    <div className="md:col-span-1 flex items-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeItem(index)
                                            }
                                            disabled={items.length === 1}
                                            className="w-full bg-red-100 text-red-600 px-3 py-2.5 rounded-lg hover:bg-red-200 disabled:opacity-40"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-end mb-8">

                    <div className="w-full md:w-80 bg-gray-50 rounded-lg p-5">

                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>

                            <span>
                                {calculateTotal().toFixed(2)}
                            </span>
                        </div>

                        <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
                            <span>Total</span>

                            <span>
                                {calculateTotal().toFixed(2)}
                            </span>
                        </div>

                    </div>

                </div>

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading
                            ? "Saving..."
                            : isEditing
                                ? "Update Invoice"
                                : "Create Invoice"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default InvoiceForm;