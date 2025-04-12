// "use client";

// import * as React from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { DayPicker } from "react-day-picker";

// import { cn } from "@/lib/utils";
// import { buttonVariants } from "@/components/ui/button";

// export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// function Calendar({
//   className,
//   classNames,
//   showOutsideDays = true,
//   ...props
// }: CalendarProps) {
//   return (
//     <DayPicker
//       showOutsideDays={showOutsideDays}
//       className={cn("p-8 w-full h-[600px] text-2xl", className)} // Increased size
//       classNames={{
//         months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
//         month: "space-y-6",
//         caption: "flex justify-center pt-2 relative items-center text-3xl", // Larger month title
//         caption_label: "text-2xl font-bold", // Larger caption label
//         nav: "space-x-3 flex items-center",
//         nav_button: cn(
//           buttonVariants({ variant: "outline" }),
//           "h-12 w-12 bg-transparent p-2 opacity-90 hover:opacity-100" // Bigger nav buttons
//         ),
//         nav_button_previous: "absolute left-4",
//         nav_button_next: "absolute right-4",
//         table: "w-full border-double space-y-3 text-2xl", // Enlarged table
//         head_row: "flex",
//         head_cell:
//           "text-muted-foreground rounded-md w-16 font-semibold text-xl", // Bigger day headers
//         row: "flex w-full mt-4",
//         cell: "h-16 w-16 text-center text-xl p-2 relative", // Bigger day cells
//         day: cn(
//           buttonVariants({ variant: "ghost" }),
//           "h-16 w-16 p-2 text-xl font-semibold" // Bigger day buttons
//         ),
//         day_selected:
//           "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
//         day_today: "bg-accent text-accent-foreground font-bold",
//         ...classNames,
//       }}
//       components={{
//         IconLeft: ({ ...props }) => <ChevronLeft className="h-8 w-8" />, // Bigger navigation icons
//         IconRight: ({ ...props }) => <ChevronRight className="h-8 w-8" />,
//       }}
//       {...props}
//     />
//   );
// }

// Calendar.displayName = "Calendar";

// export { Calendar };

"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  highlightedDates?: Date[]; // Accept highlighted dates as a prop
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  highlightedDates = [],
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-8 w-full h-[600px] text-2xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 relative items-center text-3xl",
        caption_label: "text-2xl font-bold",
        nav: "space-x-3 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-12 w-12 bg-transparent p-2 opacity-90 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-4",
        nav_button_next: "absolute right-4",
        table: "w-full border-double space-y-3 text-2xl",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-16 font-semibold text-xl",
        row: "flex w-full mt-4",
        cell: "h-16 w-16 text-center text-xl p-2 relative",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-16 w-16 p-2 text-xl font-semibold"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground font-bold",
        day_outside: "text-gray-300",
        ...classNames,
      }}
      modifiers={{
        highlighted: highlightedDates, // Highlight dates with events
      }}
      modifiersClassNames={{
        highlighted: "bg-green-300 rounded-full", // Custom styling for event days
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-8 w-8" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-8 w-8" />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
