const { Comment, User, Report } = require('../models');

// GET /api/reports/:report_id/comments
const getComments = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.report_id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    const comments = await Comment.findAll({
      where: { report_id: req.params.report_id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'role'] }],
      order: [['created_at', 'ASC']],
    });

    return res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// POST /api/reports/:report_id/comments
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    const report = await Report.findByPk(req.params.report_id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    const comment = await Comment.create({
      report_id: req.params.report_id,
      user_id: req.user.id,
      content: content.trim(),
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'role'] }],
    });

    return res.status(201).json({ success: true, message: 'Comment added.', data: fullComment });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// PUT /api/comments/:id
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    const isOwner = comment.user_id === req.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    comment.content = content.trim();
    await comment.save();

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'role'] }],
    });

    return res.status(200).json({ success: true, message: 'Comment updated.', data: fullComment });
  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    const isOwner = comment.user_id === req.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await comment.destroy();
    return res.status(200).json({ success: true, message: 'Comment deleted.' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getComments, createComment, updateComment, deleteComment };
