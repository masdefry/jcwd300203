'use client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

const emailValidationSchema = Yup.object().shape({
  newEmail: Yup.string()
    .email('Invalid email address')
    .required('New email is required'),
});

interface EmailChangeFormProps {
  currentEmail: string;
  onSubmit: (values: { newEmail: string }) => void;
  isSubmitting: boolean;
}

export const EmailChangeForm: React.FC<EmailChangeFormProps> = ({
  currentEmail,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Email</CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            newEmail: '',
          }}
          validationSchema={emailValidationSchema}
          onSubmit={async (values, { resetForm }) => {
            await onSubmit(values);
            resetForm();
          }}
        >
          {({ values, handleChange, errors, touched }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentEmail" className="text-sm font-medium">
                  Current Email
                </label>
                <Input
                  type="email"
                  id="currentEmail"
                  value={currentEmail}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="newEmail" className="text-sm font-medium">
                  New Email
                </label>
                <Input
                  type="email"
                  id="newEmail"
                  name="newEmail"
                  value={values.newEmail}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {touched.newEmail && errors.newEmail && (
                  <p className="text-sm text-red-500">{errors.newEmail}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request Email Change
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};