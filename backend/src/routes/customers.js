import express from 'express';
import { db } from '../db/index.js';
import { customers } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all customers for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let query = db.select().from(customers);
    if (userId) {
      query = query.where(eq(customers.userId, userId));
    }
    
    const allCustomers = await query;
    res.json({
      success: true,
      data: allCustomers,
      count: allCustomers.length
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
      message: error.message
    });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await db.select().from(customers).where(eq(customers.id, id));
    
    if (customer.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: customer[0]
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
      message: error.message
    });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { 
      userId, 
      name, 
      primaryDomain, 
      knownEmails, 
      overallSentiment,
      currentProjects,
      waitingOn,
      notes 
    } = req.body;
    
    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        error: 'User ID and name are required'
      });
    }
    
    const newCustomer = await db.insert(customers).values({
      userId,
      name,
      primaryDomain,
      knownEmails,
      overallSentiment: overallSentiment || 'neutral',
      currentProjects,
      waitingOn,
      notes
    }).returning();
    
    res.status(201).json({
      success: true,
      data: newCustomer[0],
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer',
      message: error.message
    });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      primaryDomain, 
      knownEmails, 
      overallSentiment,
      flaggedIssues,
      currentProjects,
      waitingOn,
      notes 
    } = req.body;
    
    const updatedCustomer = await db.update(customers)
      .set({
        name,
        primaryDomain,
        knownEmails,
        overallSentiment,
        flaggedIssues,
        currentProjects,
        waitingOn,
        notes
      })
      .where(eq(customers.id, id))
      .returning();
    
    if (updatedCustomer.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedCustomer[0],
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer',
      message: error.message
    });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCustomer = await db.delete(customers)
      .where(eq(customers.id, id))
      .returning();
    
    if (deletedCustomer.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer',
      message: error.message
    });
  }
});

export default router;
