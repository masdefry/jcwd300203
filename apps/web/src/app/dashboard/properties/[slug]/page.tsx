'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePropertyDetailsTenant } from '@/features/properties/hooks/queries/queryPropertyDetailsTenant';
import LoadingWithSpinner from '@/components/Loading';
import NotFound from '@/components/404';
import PropertyDetailsTenant from '@/components/properties/PropertyDetailsTenant';
import { PropertyEditForm } from '@/components/properties/PropertyEditForm';

const PropertyDetailsPage = () => {
  const { property, isLoading, propertyId } = usePropertyDetailsTenant();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) return <LoadingWithSpinner />;
  if (!property) return <NotFound />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Property' : property.name}</CardTitle>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="ml-4"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Property'}
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <PropertyEditForm 
              property={property}
              onEditComplete={() => setIsEditing(false)}
            />
          ) : (
            <PropertyDetailsTenant property={property} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetailsPage;