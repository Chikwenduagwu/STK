export default function Loading() {
  return (<div className="stack" aria-busy="true" aria-label="Loading"><span className="skeleton" style={{ width: 180, height: 28 }} />
    <div className="stat-grid">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton block-skel" style={{ height: 96 }} />)}</div>
    <div className="skeleton block-skel" /><div className="skeleton block-skel" /></div>);
}
