"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, useForm } from "@/features/form/tanstack-form";
import { useDebounceFn } from "@/hooks/use-debounce-fn";
import { authClient } from "@/lib/auth-client";
import { formatId } from "@/lib/format/id";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import type { NewOrganizationSchemaType } from "./new-org.schema";
import { CreateOrgSchema } from "./new-org.schema";

export const NewOrganizationForm = () => {
  const mutation = useMutation({
    mutationFn: async (values: NewOrganizationSchemaType) => {
      const result = await authClient.organization.create({
        name: values.name,
        slug: values.slug,
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Organization created successfully");
      window.location.href = `/orgs/${result.data.slug}`;
    },
  });

  const form = useForm({
    schema: CreateOrgSchema,
    defaultValues: {
      name: "",
      slug: "",
    },
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  const checkSlugMutation = useMutation({
    mutationFn: async (slug: string) => {
      const { data, error } = await authClient.organization.checkSlug({
        slug,
      });

      if (error) {
        form.fieldInfo.slug.instance?.setErrorMap({
          onChange: "This organization ID is already taken",
        });
      }

      return data;
    },
  });

  const debouncedCheckSlug = useDebounceFn((slug: string) => {
    if (slug) {
      checkSlugMutation.mutate(slug);
    }
  }, 500);

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const slug = form.getFieldValue("slug");
      if (slug) {
        debouncedCheckSlug(slug);
      }
    });

    return unsubscribe;
  }, [form, debouncedCheckSlug]);

  return (
    <div className="flex w-full flex-col gap-6 lg:gap-8">
      <Card className="bg-card overflow-hidden">
        <Form form={form}>
          <CardContent className="mt-6 flex flex-col gap-4 lg:gap-6">
            <form.AppField name="name">
              {(field) => (
                <field.Field>
                  <field.Label>Organization Name</field.Label>
                  <field.Content>
                    <field.Input
                      type="text"
                      className="input"
                      placeholder="Enter organization name"
                      onChange={(e) => {
                        const value = e.target.value;
                        field.handleChange(value);
                        const formattedSlug = formatId(value);
                        form.setFieldValue("slug", formattedSlug);
                        debouncedCheckSlug(formattedSlug);
                      }}
                    />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>
            <form.AppField name="slug">
              {(field) => (
                <field.Field>
                  <field.Label>Organization Slug</field.Label>
                  <field.Content>
                    <field.Input
                      type="text"
                      className="input"
                      placeholder="Enter organization Slug"
                      onChange={(e) => {
                        const formattedSlug = formatId(e.target.value);
                        field.handleChange(formattedSlug);
                        form.setFieldValue("slug", formattedSlug);
                        debouncedCheckSlug(formattedSlug);
                      }}
                    />
                    <field.Description>
                      The organization ID is used to identify the organization,
                      it will be used in all the URLs.
                    </field.Description>
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>
          </CardContent>
          <CardFooter className="border-border flex justify-end border-t pt-6">
            <form.SubmitButton size="lg" disabled={checkSlugMutation.isPending}>
              Create organization
            </form.SubmitButton>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
};
