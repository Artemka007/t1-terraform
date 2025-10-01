import React from 'react';
import { LogEntryComponent } from './LogEntry';
import type { RequestChain as RequestChainType } from '../../types/log.types';

interface RequestChainProps {
  chain: RequestChainType;
  readEntries: Set<string>;
  onMarkRead: (id: string) => void;
}

export const Request