import { Disclosure, Transition } from "@headlessui/react";
import { clx } from "@lib/helpers";
import { ReactNode } from "react";

type AccordionProps<L, V> = {
  className?: string;
  width?: string;
  icon?: ReactNode;
  title: string;
  children: string;
};

const Accordion = <L extends string | number = string, V = string>({
  className = "py-3 px-4.5 border border-outline dark:border-washed-dark shadow font-medium",
  width = "w-full",
  icon,
  title,
  children,
}: AccordionProps<L, V>) => {
  return (
    <Disclosure>
      {({ open }) => (
        <div>
          <Disclosure.Button as="div">
            <div
              className={clx(
                open ? "rounded-none" : "rounded-b-xl",
                "hover:border-outlineHover dark:hover:border-outlineHover-dark hover:bg-washed dark:hover:bg-washed-dark cursor-pointer rounded-t-xl",
                width,
                className
              )}
            >
              <div className="flex">
                {icon}
                <p className="pl-8">{title}</p>
              </div>
            </div>
          </Disclosure.Button>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel>
              <div className={clx("text-dim rounded-b-xl border border-t-0", width, className)}>
                {children}
              </div>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
};

export default Accordion;
