"use client";

import { toast } from "sonner";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, useForm } from "./tanstack-form";

const accountSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function TanstackFormDemo() {
  const form = useForm({
    schema: accountSchema,
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Account created successfully!");
      // eslint-disable-next-line no-console
      console.log(values);
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Create Account</CardTitle>
        <CardDescription>TanStack Form with Zod validation</CardDescription>
      </CardHeader>

      <CardContent>
        <Form form={form} className="space-y-4">
          <form.AppField name="email">
            {(field) => (
              <field.Field>
                <field.Label>Email</field.Label>
                <field.Content>
                  <field.Input type="email" placeholder="you@example.com" />
                  <field.Message />
                </field.Content>
              </field.Field>
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.Field>
                <field.Label>Password</field.Label>
                <field.Content>
                  <field.Input type="password" placeholder="••••••••" />
                  <field.Message />
                </field.Content>
              </field.Field>
            )}
          </form.AppField>

          <form.SubmitButton className="w-full">
            Create Account
          </form.SubmitButton>
        </Form>
      </CardContent>
    </Card>
  );
}
