"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [authData, setAuthData] = useState<{
    username: string;
    password: string;
  }>({
    username: "",
    password: "",
  });

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <form action="" className="w-1/4 border rounded px-8 py-6">
        <FieldGroup>
          <FieldSet>
            <FieldLegend className="text-center">Masuk</FieldLegend>
            <FieldDescription className="text-center">
              Masuk ke akun Anda
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  type="text"
                  name="username"
                  placeholder="Masukkan username"
                  value={authData.username}
                  onChange={e =>
                    setAuthData({ ...authData, username: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  name="password"
                  placeholder="Masukkan kata sandi"
                  value={authData.password}
                  onChange={e =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="w-full mt-4"
                  onClick={e => {
                    e.preventDefault();
                    signIn("credentials", {
                      username: authData.username,
                      password: authData.password,
                      redirect: false,
                      // callbackUrl: "/dashboard",
                    }).then(callback => {
                      if (callback?.error) {
                        return toast.error(callback.error, {
                          richColors: true,
                        });
                      }

                      toast.success("Berhasil masuk!", { richColors: true });
                      router.push("/dashboard");
                    });
                  }}>
                  Masuk
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
