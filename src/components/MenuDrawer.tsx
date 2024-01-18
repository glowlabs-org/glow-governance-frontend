import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { link } from 'fs'

const links = [
  {
    name: 'Home',
    href: '/',
    description: 'The home page',
  },
  {
    name: 'Stats',
    href: '/early',
    description: 'See early liqudity and protocol fee donations',
  },
  {
    name: 'Output',
    href: '/output',
    description: 'See farm output',
  },
  {
    name: 'Impact Leaderboard',
    href: '/impact-leaderboard',
    description: 'The impact poinsts leaderboard',
  },
  {
    name: 'Rewards',
    href: '/rewards',
    description: 'See the rewards available for farms',
  },
]
export const MenuDrawer = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <svg width="20" height="15" xmlns="http://www.w3.org/2000/svg">
          <g fill="#000000" stroke="none">
            <rect width="20" height="3"></rect>
            <rect y="6" width="20" height="3"></rect>
            <rect y="12" width="20" height="3"></rect>
          </g>
        </svg>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            {/* This action cannot be undone. This will permanently delete your
            account and remove your data from our servers. */}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-y-4">
          {links.map((link) => {
            return (
              <a href={link.href}>
                <div className="flex flex-row items-center gap-x-4">
                  <div className="flex flex-col">
                    <p className="font-bold">{link.name}</p>
                    <p className="text-sm text-slate-500">{link.description}</p>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
