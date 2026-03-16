"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { PLAYGROUND_KEY } from "@/constants/keys";
import { THEME_STORAGE_KEY, ThemeMode } from "@/constants/theme";

type PalettePage = "root" | "navigation" | "settings";

interface PaletteCommand {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  shortcut?: string;
  disabled?: boolean;
  action?: () => void;
  page?: PalettePage;
}

const HOTKEY_OPTIONS = {
  enableOnFormTags: false,
  preventDefault: true,
};

const SEQUENCE_TIMEOUT_MS = 2000;

function commandMatchesQuery(command: PaletteCommand, query: string) {
  if (!query) return true;

  const searchableText = [
    command.label,
    command.description ?? "",
    ...(command.keywords ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

export default function GlobalCommandPalette() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState<PalettePage[]>([]);

  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const sequenceRef = useRef<{ key: string; expiresAt: number } | null>(null);

  const currentPage = pages.length > 0 ? pages[pages.length - 1] : "root";

  const navigateTo = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setPages([]);
      setSearch("");
    },
    [router],
  );

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event("sql-theme-updated"));
  }, []);

  const toggleTheme = useCallback(() => {
    const currentTheme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  }, [setTheme]);

  const resetLessonProgress = useCallback(() => {
    window.localStorage.removeItem(PLAYGROUND_KEY);
    window.location.reload();
  }, []);

  const openPalette = useCallback(() => {
    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setPages([]);
    setSearch("");

    requestAnimationFrame(() => {
      previouslyFocusedElementRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    const openFromUi = () => {
      openPalette();
    };

    window.addEventListener("open-global-command-palette", openFromUi);

    return () => {
      window.removeEventListener("open-global-command-palette", openFromUi);
    };
  }, [openPalette]);

  useEffect(() => {
    setOpen(false);
    setPages([]);
    setSearch("");
  }, [pathname]);

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        openPalette();
      } else {
        closePalette();
      }
    },
    [closePalette, openPalette],
  );

  useHotkeys(
    "mod+k",
    (event) => {
      event.preventDefault();
      handleDialogOpenChange(!open);
    },
    HOTKEY_OPTIONS,
    [open, handleDialogOpenChange],
  );

  // Example sequential hotkey: press "g" then "i" quickly to jump to dashboard/sandbox.
  useHotkeys(
    "g",
    () => {
      if (open) return;
      sequenceRef.current = {
        key: "g",
        expiresAt: Date.now() + SEQUENCE_TIMEOUT_MS,
      };
    },
    HOTKEY_OPTIONS,
    [open],
  );

  useHotkeys(
    "i",
    () => {
      if (open) return;

      const sequence = sequenceRef.current;
      if (sequence?.key === "g" && sequence.expiresAt > Date.now()) {
        navigateTo("/sandbox");
      }

      sequenceRef.current = null;
    },
    HOTKEY_OPTIONS,
    [open, navigateTo],
  );

  const rootCommands = useMemo<PaletteCommand[]>(
    () => [
      {
        id: "go-to-page",
        label: "Go to ->",
        description: "Open the route navigation commands",
        keywords: ["navigation", "routes", "go"],
        page: "navigation",
      },
      {
        id: "settings-page",
        label: "Settings ->",
        description: "Open appearance and local app settings",
        keywords: ["settings", "theme", "preferences"],
        page: "settings",
      },
      {
        id: "open-sandbox",
        label: "Open SQL Server (T-SQL) sandbox",
        description: "Jump directly to the practice sandbox",
        keywords: ["sandbox", "practice", "dashboard", "inbox"],
        shortcut: "G then I",
        action: () => navigateTo("/sandbox"),
      },
      {
        id: "open-lessons",
        label: "Open lessons",
        description: "Browse learning modules",
        keywords: ["lessons", "learn", "tutorial"],
        action: () => navigateTo("/lessons"),
      },
      {
        id: "open-visualizer",
        label: "Open SQL visualizer",
        description: "Step through SQL execution order",
        keywords: ["visualizer", "execution", "diagram"],
        action: () => navigateTo("/visualizer"),
      },
      {
        id: "open-glossary",
        label: "Open glossary",
        description: "Look up SQL terminology",
        keywords: ["glossary", "definitions", "terms"],
        action: () => navigateTo("/glossary"),
      },
      {
        id: "assignment-disabled",
        label: "Assignment bundle import (coming soon)",
        description: "Planned feature",
        keywords: ["assignment", "import", "bundle"],
        disabled: true,
      },
    ],
    [navigateTo],
  );

  const navigationCommands = useMemo<PaletteCommand[]>(
    () => [
      {
        id: "nav-home",
        label: "Go to Home",
        keywords: ["home", "landing"],
        action: () => navigateTo("/"),
      },
      {
        id: "nav-lessons",
        label: "Go to Lessons",
        keywords: ["lessons", "learn"],
        action: () => navigateTo("/lessons"),
      },
      {
        id: "nav-sandbox",
        label: "Go to SQL Server (T-SQL) Sandbox",
        keywords: ["sandbox", "practice", "dashboard", "inbox"],
        shortcut: "G then I",
        action: () => navigateTo("/sandbox"),
      },
      {
        id: "nav-visualizer",
        label: "Go to Visualizer",
        keywords: ["visualizer", "flow"],
        action: () => navigateTo("/visualizer"),
      },
      {
        id: "nav-glossary",
        label: "Go to Glossary",
        keywords: ["glossary", "terms"],
        action: () => navigateTo("/glossary"),
      },
    ],
    [navigateTo],
  );

  const settingsCommands = useMemo<PaletteCommand[]>(
    () => [
      {
        id: "toggle-theme",
        label: "Toggle dark mode",
        description: "Switch between light and dark appearance",
        keywords: ["theme", "dark", "light", "appearance"],
        action: () => {
          toggleTheme();
          closePalette();
        },
      },
      {
        id: "clear-progress",
        label: "Reset lesson progress",
        description: "Clear saved lesson completion state",
        keywords: ["reset", "progress", "storage"],
        action: () => {
          closePalette();
          resetLessonProgress();
        },
      },
    ],
    [closePalette, resetLessonProgress, toggleTheme],
  );

  const pageCommands =
    currentPage === "navigation"
      ? navigationCommands
      : currentPage === "settings"
        ? settingsCommands
        : rootCommands;

  const normalizedQuery = search.trim().toLowerCase();
  const filteredCommands = pageCommands.filter((command) =>
    commandMatchesQuery(command, normalizedQuery),
  );

  const resultAnnouncement =
    filteredCommands.length === 1
      ? "1 command available"
      : `${filteredCommands.length} commands available`;

  const pageTitle =
    currentPage === "navigation"
      ? "Navigation"
      : currentPage === "settings"
        ? "Settings"
        : "Global";

  const runCommand = useCallback((command: PaletteCommand) => {
    if (command.disabled) return;

    if (command.page) {
      setPages((currentPages) => [...currentPages, command.page!]);
      setSearch("");
      return;
    }

    command.action?.();
  }, []);

  const popPage = useCallback(() => {
    setPages((currentPages) => currentPages.slice(0, -1));
    setSearch("");
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={handleDialogOpenChange}>
        <div
          onKeyDown={(event) => {
            if (
              event.key === "Backspace" &&
              search === "" &&
              pages.length > 0
            ) {
              event.preventDefault();
              popPage();
            }

            if (event.key === "Escape" && pages.length > 0) {
              event.preventDefault();
              popPage();
            }
          }}
        >
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search routes..."
            autoFocus
          />

          <p className="sr-only" aria-live="polite">
            {resultAnnouncement}
          </p>

          <CommandList>
            <CommandEmpty>No matching commands.</CommandEmpty>

            {pages.length > 0 && (
              <CommandGroup heading="Navigation">
                <CommandItem
                  value="back"
                  onSelect={popPage}
                  className="font-medium"
                >
                  <span aria-hidden="true">←</span>
                  <span>Back to previous menu</span>
                  <CommandShortcut>Backspace</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            )}

            {pages.length > 0 && <CommandSeparator />}

            <CommandGroup heading={pageTitle}>
              {filteredCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  value={`${command.label}-${command.description ?? ""}`}
                  disabled={command.disabled}
                  onSelect={() => runCommand(command)}
                >
                  <span className="flex flex-col">
                    <span>{command.label}</span>
                    {command.description && (
                      <span className="text-xs text-current/80">
                        {command.description}
                      </span>
                    )}
                  </span>
                  {command.shortcut && (
                    <CommandShortcut>{command.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            {currentPage === "root" && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Current route">
                  <CommandItem
                    value="current-route"
                    onSelect={() => {
                      closePalette();
                    }}
                  >
                    <span>You are on</span>
                    <CommandShortcut>{pathname}</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </div>
      </CommandDialog>

      {/* Hidden live region for broader app-level shortcut announcements. */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {open ? "Command palette open" : "Command palette closed"}
      </div>
    </>
  );
}
