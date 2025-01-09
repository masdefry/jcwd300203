'use client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, Home } from 'lucide-react';
import Link from 'next/link';
import { useGetProperties } from '@/features/properties/hooks/queries/queryGetProperties';
import { useDeleteProperty } from '@/features/properties/hooks/mutations/mutateDeleteProperty';
import { DeletePropertyDialog } from '@/components/properties/DeletePropertyDialog';
import { useState } from 'react';
import LoadingWithSpinner from '@/components/Loading';

const PropertyList = () => {
  const { data: properties, isLoading, error, isError } = useGetProperties();
  const deletePropertyMutation = useDeleteProperty();
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    propertyId: number | null;
    propertyName: string;
  }>({
    isOpen: false,
    propertyId: null,
    propertyName: '',
  });

  if (isLoading) return <LoadingWithSpinner/>

  const handleDeleteClick = (propertyId: number, propertyName: string) => {
    setDeleteDialogState({
      isOpen: true,
      propertyId,
      propertyName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialogState.propertyId) {
      try {
        await deletePropertyMutation.mutateAsync(deleteDialogState.propertyId);
        setDeleteDialogState({ isOpen: false, propertyId: null, propertyName: '' });
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogState({ isOpen: false, propertyId: null, propertyName: '' });
  };

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Properties</h1>
          <Link href="/dashboard/properties/add">
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              Add New Property
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <img
                    src={`http://localhost:4700/images/${property.mainImage}` || '/api/placeholder/400/300'}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-blue-500">
                    {property.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-xl mb-2">{property.name}</CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Home size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{property.city}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {property.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {property.roomCapacity} Rooms
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                <Link href={`/dashboard/properties/${property.id}/edit`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Pencil size={14} />
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleDeleteClick(property.id, property.name)}
                  disabled={deletePropertyMutation.isPending}
                >
                  <Trash2 size={14} />
                  {deletePropertyMutation.isPending && deleteDialogState.propertyId === property.id 
                    ? "Deleting..." 
                    : "Delete"
                  }
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {(!properties || properties.length === 0) && (
          <div className="text-center py-12">
            <Home size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first property</p>
            <Link href="/dashboard/listing">
              <Button>
                Add Your First Property
              </Button>
            </Link>
          </div>
        )}
      </div>

      <DeletePropertyDialog 
        isOpen={deleteDialogState.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        propertyName={deleteDialogState.propertyName}
        isDeleting={deletePropertyMutation.isPending}
      />
    </>
  );
};

export default PropertyList;