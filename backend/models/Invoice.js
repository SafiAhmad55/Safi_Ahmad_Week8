const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },

    total: {
        type: Number,
        default: 0
    }
});

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        issueDate: {
            type: Date,
            required: true
        },

        dueDate: {
            type: Date,
            required: true
        },

        items: {
            type: [invoiceItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "Invoice must contain at least one item"
            }
        },

        subtotal: {
            type: Number,
            default: 0
        },

        totalAmount: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["Draft", "Sent", "Paid", "Overdue"],
            default: "Draft"
        }
    },
    {
        timestamps: true
    }
);

invoiceSchema.pre("save", function () {
    this.items.forEach((item) => {
        item.total = item.quantity * item.unitPrice;
    });

    this.subtotal = this.items.reduce(
        (sum, item) => sum + item.total,
        0
    );

    this.totalAmount = this.subtotal;
});

module.exports = mongoose.model("Invoice", invoiceSchema);