import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Feature failed", error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback ?? <div className="error-state"><strong>Unable to load this area.</strong><button onClick={() => this.setState({ failed: false })}>Try again</button></div>;
    }
    return this.props.children;
  }
}
