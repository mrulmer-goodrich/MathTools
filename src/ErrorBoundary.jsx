import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error){ return { hasError: true, error }; }
  componentDidCatch(error, info){ console.error('Render error:', error, info); }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:20}}>
          <h1>Something went wrong.</h1>
          <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.error)}</pre>
          <p style={{opacity:.7}}>Check the browser console for stack traces.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
