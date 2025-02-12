// import * as React from "react";
// import { format } from "date-fns";
// import { CalendarIcon } from "lucide-react";

// import { cn } from "./utils";
// import { Button } from "./button";
// import { Calendar } from "./calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "./popover";

// export const DatePicker = () => {
//   const [date, setDate] = React.useState();

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button
//           variant={"outline"}
//           className={cn(
//             "w-[240px] justify-start text-left font-normal",
//             !date && "text-muted-foreground"
//           )}
//         >
//           <CalendarIcon className="mr-2 h-4 w-4" />
//           {date ? format(date, "PPP") : <span>Pick a date</span>}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0" align="start">
//         <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
//       </PopoverContent>
//     </Popover>
//   );
// };

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export const DatePicker = ({ selected, onChange, placeholder = "Pick a date" }) => {
  const handleDateSelect = (selectedDate) => {
    console.log("Selected date:", selectedDate);
    if (selectedDate && onChange) {
      onChange(selectedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar 
          mode="single" 
          selected={selected} 
          onSelect={handleDateSelect}
          initialFocus 
        />
      </PopoverContent>
    </Popover>
  );
};