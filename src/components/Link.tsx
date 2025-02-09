import NextLink from "next/link";
import { ComponentProps } from "react";

interface CustomLinkProps extends ComponentProps<typeof NextLink> {
  children: React.ReactNode;
}

const Link = ({ href, children, ...props }: CustomLinkProps) => {
  return (
    <NextLink
      href={href}
      className="px-4 py-1 text-lg font-semibold text-white rounded-lg bg-pink hover:bg-pink/70 hover:text-black/50"
      {...props}>
      {children}
    </NextLink>
  );
};

export default Link;
