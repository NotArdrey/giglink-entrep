/**
 * AdminCommentsSection - View Component
 * 
 * Displays comments for moderation with delete actions.
 * Pure presentation component.
 */

import PropTypes from 'prop-types';

function AdminCommentsSection({ comments, commentsError, onOpenDeleteComment, styles }) {
  return (
    <section style={{ ...styles.contentGrid, gridTemplateColumns: '1fr' }}>
      <article style={styles.panel}>
        <div style={styles.panelHeader}>
          <div style={styles.panelTitleWrap}>
            <h2 style={styles.panelTitle}>Summary / Comment Moderation</h2>
            <p style={styles.panelDesc}>
              Review worker comments from the reviews table and remove entries that violate platform policy.
            </p>
          </div>
        </div>

        {commentsError ? (
          <div style={styles.emptyState}>{commentsError}</div>
        ) : comments.length > 0 ? (
          <div style={styles.commentList}>
            {comments.map((comment) => (
              <div key={comment.id} style={styles.commentCard}>
                <div style={styles.commentHeader}>
                  <div>
                    <p style={{ ...styles.commentMeta, marginBottom: '2px' }}>
                      Worker: <strong>{comment.worker}</strong>
                    </p>
                    <p style={styles.commentMeta}>From: {comment.client}</p>
                  </div>
                  <span style={{ ...styles.badge, ...styles.badgeAdmin }}>
                    {comment.rating} ★
                  </span>
                </div>

                <p style={styles.commentText}>{comment.comment}</p>

                <div style={styles.commentActions}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(comment.status === 'flagged'
                        ? styles.badgeDisabled
                        : comment.status === 'review'
                          ? { backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa' }
                          : styles.badgeActive),
                    }}
                  >
                    {comment.status}
                  </span>
                  <button
                    type="button"
                    style={styles.rowButton}
                    onClick={() => onOpenDeleteComment(comment)}
                  >
                    Delete Comment
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>No comments to moderate.</div>
        )}
      </article>
    </section>
  );
}

AdminCommentsSection.propTypes = {
  comments: PropTypes.arrayOf(PropTypes.object).isRequired,
  commentsError: PropTypes.string,
  onOpenDeleteComment: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};

AdminCommentsSection.defaultProps = {
  commentsError: '',
};

export default AdminCommentsSection;
