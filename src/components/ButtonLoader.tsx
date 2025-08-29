import { Loader2 } from "lucide-react";

const ButtonLoader = ({ isSubmitting }: { isSubmitting: boolean }) => {
  return (
    <span className={isSubmitting ? "" : "hidden"}>
      <Loader2 className="animate-spin" />
    </span>
  );
};

export default ButtonLoader;
