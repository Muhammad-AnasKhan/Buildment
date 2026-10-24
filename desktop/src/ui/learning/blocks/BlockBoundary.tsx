import { Component, type ReactNode } from 'react';

export class BlockBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div
          role="alert"
          className="my-6 rounded-xl border border-border bg-card p-5 text-sm leading-6"
        >
          This block could not be displayed. You can continue reading the rest
          of the lesson.
        </div>
      );
    return this.props.children;
  }
}
