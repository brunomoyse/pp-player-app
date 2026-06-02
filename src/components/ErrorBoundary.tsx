import { Component, type ReactNode } from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';

interface Props {
  children: ReactNode;
  fallback?: (reset: () => void, error: Error) => ReactNode;
}

interface State {
  error: Error | null;
}

/** App-wide crash guard — keeps a render error from taking down the whole tree. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset, error);

    return (
      <View className="flex-1 items-center justify-center gap-4 bg-pp-bg px-8">
        <Text variant="title" className="text-center">
          Something went wrong
        </Text>
        <Text variant="muted" className="text-center">
          {error.message}
        </Text>
        <Button title="Try again" variant="secondary" onPress={this.reset} />
      </View>
    );
  }
}
