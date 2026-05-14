function BrandWordmark({ className = '', ...props }) {
  const classes = ['gl-wordmark', className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      <span className="gl-wordmark-gig">Gig</span>
      <span className="gl-wordmark-link">Link</span>
    </span>
  );
}

export default BrandWordmark;
