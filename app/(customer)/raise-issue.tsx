import React from 'react';
import RaiseIssueScreen from './tickets/new';

/**
 * Tab route for "Add Issue" in the customer bottom navigation.
 * Reuses the existing, fully-tested RaiseIssueScreen.
 */
export default function RaiseIssueTabRoute() {
  return <RaiseIssueScreen />;
}
