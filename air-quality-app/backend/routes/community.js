const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const CommunityAction = require('../models/CommunityAction');
const UserAction = require('../models/UserAction');

/**
 * GET /api/community/actions
 * Get all active community actions
 */
router.get('/actions', verifyToken, async (req, res) => {
    try {
        const actions = await CommunityAction.find({ is_active: true })
            .sort({ created_date: -1 })
            .limit(10);

        // Check which actions the user has completed
        const userActions = await UserAction.find({
            user_id: req.userId,
            action_id: { $in: actions.map(a => a._id) }
        });

        const completedActionIds = new Set(userActions.map(ua => ua.action_id.toString()));

        const actionsWithStatus = actions.map(action => ({
            id: action._id,
            title: action.title,
            description: action.description,
            action_type: action.action_type,
            action_url: action.action_url,
            completed_count: action.completed_count,
            is_completed_by_user: completedActionIds.has(action._id.toString()),
            created_date: action.created_date
        }));

        res.json({
            success: true,
            actions: actionsWithStatus
        });

    } catch (error) {
        console.error('Fetch actions error:', error);
        res.status(500).json({ error: 'Unable to fetch actions' });
    }
});

/**
 * POST /api/community/actions/:id/complete
 * Mark an action as completed by the user
 */
router.post('/actions/:id/complete', verifyToken, async (req, res) => {
    try {
        const actionId = req.params.id;

        // Check if action exists
        const action = await CommunityAction.findById(actionId);
        if (!action) {
            return res.status(404).json({ error: 'Action not found' });
        }

        // Check if already completed
        const existingUserAction = await UserAction.findOne({
            user_id: req.userId,
            action_id: actionId
        });

        if (existingUserAction) {
            return res.status(400).json({ error: 'Action already completed' });
        }

        // Create user action record
        await UserAction.create({
            user_id: req.userId,
            action_id: actionId
        });

        // Increment completed count
        action.completed_count += 1;
        await action.save();

        res.json({
            success: true,
            message: 'Action marked as completed',
            completed_count: action.completed_count
        });

    } catch (error) {
        console.error('Complete action error:', error);
        res.status(500).json({ error: 'Unable to complete action' });
    }
});

module.exports = router;
