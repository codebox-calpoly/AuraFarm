/** Must match backend `ChallengeCategory` enum. */
export type ChallengeCategory =
  | "sports"
  | "outdoors"
  | "clubs"
  | "campus"
  | "beach"
  | "volunteering"
  | "arts_culture"
  | "misc";

export const CHALLENGE_CATEGORY_LABEL: Record<ChallengeCategory, string> = {
  sports: "Sports",
  outdoors: "Outdoors",
  clubs: "Clubs & events",
  campus: "Campus",
  beach: "Beach & water",
  volunteering: "Volunteering",
  arts_culture: "Arts & culture",
  misc: "Misc",
};

export type ChallengeFilterId = "all" | ChallengeCategory;

export const CHALLENGE_FILTER_CHIPS: { id: ChallengeFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sports", label: "Sports" },
  { id: "outdoors", label: "Outdoors" },
  { id: "clubs", label: "Clubs" },
  { id: "campus", label: "Campus" },
  { id: "beach", label: "Beach" },
  { id: "volunteering", label: "Volunteering" },
  { id: "arts_culture", label: "Arts" },
  { id: "misc", label: "Misc" },
];
