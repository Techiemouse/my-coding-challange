import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { partySchema } from "../schemas/partySchema";
import type { PartyFormValues } from "../schemas/partySchema";
import { FormField } from "./FormField";
import type { ValidationError } from "../generated/types.gen";

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40";
const inputErrorClass = "border-red-400 focus:ring-red-300";

export const CreatePartyForm = () => {
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema),
    defaultValues: { type: "Natural Person" },
  });

  const type = watch("type");

  const onSubmit = async (data: PartyFormValues) => {
    setSubmitState({ status: "loading" });

    try {
      const res = await fetch("/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 201) {
        const { id } = await res.json();
        setSubmitState({ status: "success", id });
        return;
      }

      const { errors: serverErrors }: ValidationError = await res.json();
      serverErrors.forEach(({ field, message }) => {
        setError(field as keyof PartyFormValues, { message });
      });
      setSubmitState({ status: "idle" });
    } catch {
      setSubmitState({
        status: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  };

  if (submitState.status === "success") {
    const handleClose = () => {
      reset();
      setSubmitState({ status: "idle" });
    };

    return (
      <div className="relative text-center py-8 fade-in">
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="text-4xl mb-3">✓</div>
        <h2 className="text-lg font-semibold text-gray-800">Party registered</h2>
        <p className="text-sm text-gray-500 mt-1">
          Reference:{" "}
          <span className="font-mono text-gray-700">{submitState.id}</span>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {(["Natural Person", "Legal Entity"] as const).map((value) => (
          <label
            key={value}
            className={`flex-1 text-center py-2 text-sm cursor-pointer transition-colors ${
              type === value
                ? "bg-brand-blue text-white font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <input
              {...register("type")}
              type="radio"
              value={value}
              className="sr-only"
            />
            {value}
          </label>
        ))}
      </div>

      <FormField
        label="Email address"
        htmlFor="email"
        error={errors.email?.message}
      >
        <input
          {...register("email")}
          id="email"
          type="email"
          className={`${inputClass} ${errors.email ? inputErrorClass : ""}`}
        />
      </FormField>

      <FormField
        label="Postcode"
        htmlFor="postcode"
        error={errors.postcode?.message}
      >
        <input
          {...register("postcode")}
          id="postcode"
          type="text"
          className={`${inputClass} ${errors.postcode ? inputErrorClass : ""}`}
        />
      </FormField>

      {type === "Natural Person" && (
        <div className="flex flex-col gap-5 fade-in">
          <FormField
            label="Full name"
            htmlFor="fullName"
            error={errors.fullName?.message}
          >
            <input
              {...register("fullName")}
              id="fullName"
              type="text"
              className={`${inputClass} ${errors.fullName ? inputErrorClass : ""}`}
            />
          </FormField>

          <FormField
            label="Date of birth"
            htmlFor="dateOfBirth"
            error={errors.dateOfBirth?.message}
          >
            <input
              {...register("dateOfBirth")}
              id="dateOfBirth"
              type="date"
              className={`${inputClass} ${errors.dateOfBirth ? inputErrorClass : ""}`}
            />
          </FormField>
        </div>
      )}

      {type === "Legal Entity" && (
        <div className="flex flex-col gap-5 fade-in">
          <FormField
            label="Registered name"
            htmlFor="registeredName"
            error={errors.registeredName?.message}
          >
            <input
              {...register("registeredName")}
              id="registeredName"
              type="text"
              className={`${inputClass} ${errors.registeredName ? inputErrorClass : ""}`}
            />
          </FormField>

          <FormField
            label="Company registration number"
            htmlFor="companyRegistrationNumber"
            error={errors.companyRegistrationNumber?.message}
          >
            <input
              {...register("companyRegistrationNumber")}
              id="companyRegistrationNumber"
              type="text"
              className={`${inputClass} ${errors.companyRegistrationNumber ? inputErrorClass : ""}`}
            />
          </FormField>
        </div>
      )}

      {submitState.status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {submitState.message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitState.status === "loading"}
        className="w-full rounded-md bg-brand-blue hover:bg-brand-blue-hover py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
      >
        {submitState.status === "loading" ? "Saving..." : "Create party"}
      </button>
    </form>
  );
};
