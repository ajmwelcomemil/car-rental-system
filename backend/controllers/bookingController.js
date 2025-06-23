const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const fs = require('fs');

//create booking
exports.createBooking = async (req, res) => {
  try {
    const { vehicleId, pickupDate, dropoffDate } = req.body;

    if (!vehicleId || !pickupDate || !dropoffDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const start = moment(pickupDate).startOf('day');
    const end = moment(dropoffDate).startOf('day');
    const today = moment().startOf('day');

    if (start.isBefore(today)) {
      return res.status(400).json({ message: 'Pickup date cannot be before today' });
    }

    const diffDays = end.diff(start, 'days');
    if (diffDays < 1 || diffDays > 30) {
      return res.status(400).json({ message: 'Dropoff date must be at least next day and at most 30 days after pickup date' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    // ✅ Check if vehicle is marked unavailable by admin
if (!vehicle.availability) {
  return res.status(400).json({ message: 'Vehicle is currently unavailable for booking' });
}

    // 🔥 Only block if active booking exists
    const overlappingBooking = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ['Pending', 'Approved', 'In Use'] }, 
      $or: [
        {
          pickupDate: { $lt: end.toDate() },
          dropoffDate: { $gt: start.toDate() }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Vehicle already booked for selected dates' });
    }

    const totalDays = diffDays;
    const totalPrice = totalDays * vehicle.pricePerDay;

    const booking = new Booking({
      user: req.user._id,
      vehicle: vehicleId,
      pickupDate: start.toDate(),
      dropoffDate: end.toDate(),
      totalDays,
      totalPrice,
      status: 'Pending'  // default status
    });

    await booking.save();

    res.status(201).json(booking);

  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
//get bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('vehicle', 'name brand pricePerDay images')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking || booking.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (new Date(booking.pickupDate) <= new Date()) {
      return res.status(400).json({ message: 'Cannot cancel after pickup date' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.generateInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('vehicle user');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    doc.pipe(res);

    // Header
    doc
      .fontSize(24)
      .fillColor('#333')
      .text('Booking Invoice', { align: 'center' })
      .moveDown();

    // Company Info
    doc
      .fontSize(10)
      .fillColor('#666')
      .text('AJM Car Rentals Pvt. Ltd.', 50, 80)
      .text('Maruthaniyil, Prakash P.O Udayagiri')
      .text('Email: antomaruthaniyil@yahoo.com | Phone: +916282289862')
      .moveDown(2);

    // Invoice Info
    doc
      .fontSize(12)
      .fillColor('#000')
      .text(`Invoice #: INV-${booking._id.toString().slice(-6).toUpperCase()}`, { align: 'right' })
      .text(`Invoice Date: ${new Date().toDateString()}`, { align: 'right' })
      .moveDown(1.5);

    // User Info
    doc
      .fontSize(12)
      .text(`Customer Name: ${booking.user.name}`)
      .text(`Email: ${booking.user.email}`)
      .moveDown();

    // Vehicle Info
    doc
      .fontSize(12)
      .text(`Vehicle: ${booking.vehicle.brand} ${booking.vehicle.name}`)
      .text(`Booking ID: ${booking._id}`)
      .text(`Pickup Date: ${booking.pickupDate.toDateString()}`)
      .text(`Drop-off Date: ${booking.dropoffDate.toDateString()}`)
      .text(`Status: ${booking.status}`)
      .moveDown(1);

    // Invoice Table
    doc
      .fillColor('#000')
      .fontSize(12)
      .text('Item', 50, doc.y)
      .text('Description', 150, doc.y)
      .text('Amount (Rs)', 450, doc.y, { align: 'right' })
      .moveDown(0.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor('#aaa')
      .stroke();

    doc
      .text('1', 50, doc.y + 5)
      .text(`${booking.vehicle.name} Rental`, 150, doc.y + 5)
      .text(`${booking.totalPrice}`, 450, doc.y + 5, { align: 'right' });

    doc
      .moveDown(2)
      .fontSize(14)
      .text(`Total Amount: Rs ${booking.totalPrice}`, { align: 'right' })
      .moveDown(2);

    // Footer
    doc
      .fontSize(10)
      .fillColor('#666')
      .text('Thank you for choosing AJM Car Rentals!', { align: 'center' })
      .text('For support, contact us at antomaruthaniyil@yahoo.com', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
