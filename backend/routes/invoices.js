const express = require("express");
const router = express.Router();

const Invoice = require("../models/Invoice");
const authMiddleware = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

// CREATE Invoice
router.post("/", authMiddleware, async (req, res) => {
    try {
        const invoice = new Invoice(req.body);

        const savedInvoice = await invoice.save();

        res.status(201).json(savedInvoice);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// GET all invoices with search and filters
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { search, client, project, status } = req.query;

        let filter = {};

        // Search by invoice number
        if (search) {
            filter.invoiceNumber = {
                $regex: search,
                $options: "i"
            };
        }

        // Filter by client
        if (client) {
            filter.client = client;
        }

        // Filter by project
        if (project) {
            filter.project = project;
        }

        // Filter by status
        if (status) {
            filter.status = status;
        }

        const invoices = await Invoice.find(filter)
            .populate("client")
            .populate("project");

        res.json(invoices);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
// GET single invoice
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate("client")
            .populate("project");

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        res.json(invoice);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// UPDATE Invoice
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        // Update invoice fields
        invoice.invoiceNumber = req.body.invoiceNumber;
        invoice.client = req.body.client;
        invoice.project = req.body.project;
        invoice.issueDate = req.body.issueDate;
        invoice.dueDate = req.body.dueDate;
        invoice.items = req.body.items;
        invoice.status = req.body.status;

        
        const updatedInvoice = await invoice.save();

        res.json(updatedInvoice);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// DELETE Invoice
router.delete( "/:id",authMiddleware,authorizeRoles("Admin"),async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        res.json({
            message: "Invoice deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;