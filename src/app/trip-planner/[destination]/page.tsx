'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import TripPlannerClient from '../TripPlannerClient';

export default function DynamicTripPlannerPage() {
  const params = useParams();
  const destination = typeof params?.destination === 'string' ? params.destination : '';
  
  return <TripPlannerClient initialDestination={destination} />;
}
