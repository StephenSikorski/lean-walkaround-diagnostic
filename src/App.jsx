import React, { useEffect, useMemo, useState } from "react";

/*
 Lean Walkaround Diagnostic App
 Mobile-first, offline-capable via localStorage
 Exports Diagnostic + Executive Debrief
*/

const RESP = {
  YES: "yes",
  PARTIAL: "partial",
  NO: "no",
  NA: "na",
};

const respLabel = (v) =>
  v === RESP.YES ? "Yes" :
  v === RESP.PARTIAL ? "Somewhat" :
  v === RESP.NO ? "No" :
  v === RESP.NA ? "N/A" : "";

const scoreVal = (v) =>
  v === RESP.YES ? 1 :
  v === RESP.PARTIAL ? 0.5 :
  v === RESP.NO ? 0 :
  null;

const STORAGE_KEY = "srs_walkaround_v1";

const DIAGNOSTIC = [
  {
    id: "control",
    title: "SECTION 1 — CONTROL & STABILITY",
    groups: [
      {
        id: "flow",
