import { CreateButton } from '@/components/refine-ui/buttons/create'
import { DataTable } from '@/components/refine-ui/data-table/data-table'
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { ListView } from '@/components/refine-ui/views/list-view'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useTable } from '@refinedev/react-table'
import { useList } from '@refinedev/core'
import { useMemo, useState } from 'react'
import { ClassDetails, Subject, User } from '@/types'
import { ColumnDef } from '@tanstack/react-table'

const ClassList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')

  const searchFilters = searchQuery
    ? [{ field: 'name', operator: 'contains' as const, value: searchQuery }]
    : []

  const subjectFilters =
    selectedSubject && selectedSubject !== 'all'
      ? [{ field: 'subject', operator: 'eq' as const, value: selectedSubject }]
      : []

  const teacherFilters =
    selectedTeacher && selectedTeacher !== 'all'
      ? [{ field: 'teacher', operator: 'eq' as const, value: selectedTeacher }]
      : []

  // Fetch subjects for filter dropdown
  const { query: subjectsQuery } = useList<Subject>({
    resource: 'subjects',
    pagination: { pageSize: 100 },
  })

  // Fetch teachers for filter dropdown
  const { query: teachersQuery } = useList<User>({
    resource: 'users',
    filters: [{ field: 'role', operator: 'eq', value: 'teacher' }],
    pagination: { pageSize: 100 },
  })

  const subjects = subjectsQuery.data?.data ?? []
  const teachers = teachersQuery.data?.data ?? []

  const classTable = useTable<ClassDetails>({
    columns: useMemo<ColumnDef<ClassDetails>[]>(() => [
      {
        id: 'banner',
        accessorKey: 'bannerUrl',
        size: 80,
        header: () => <p className="column-title ml-2">Banner</p>,
        cell: ({ getValue }) => {
          const url = getValue<string | undefined>()
          return url ? (
            <img
              src={url}
              alt="banner"
              className="h-10 w-16 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-16 rounded bg-muted" />
          )
        },
      },
      {
        id: 'name',
        accessorKey: 'name',
        size: 200,
        header: () => <p className="column-title">Class Name</p>,
        cell: ({ getValue }) => (
          <span className="text-foreground font-medium">{getValue<string>()}</span>
        ),
        filterFn: 'includesString',
      },
      {
        id: 'status',
        accessorKey: 'status',
        size: 100,
        header: () => <p className="column-title">Status</p>,
        cell: ({ getValue }) => {
          const status = getValue<string>()
          return (
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          )
        },
      },
      {
        id: 'subject',
        accessorKey: 'subject.name',
        size: 160,
        header: () => <p className="column-title">Subject</p>,
        cell: ({ getValue }) => (
          <Badge variant="secondary">{getValue<string>()}</Badge>
        ),
      },
      {
        id: 'teacher',
        accessorKey: 'teacher.name',
        size: 160,
        header: () => <p className="column-title">Teacher</p>,
        cell: ({ getValue }) => (
          <span className="text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: 'capacity',
        accessorKey: 'capacity',
        size: 90,
        header: () => <p className="column-title">Capacity</p>,
        cell: ({ getValue }) => (
          <span className="text-foreground">{getValue<number>()}</span>
        ),
      },
    ], []),
    refineCoreProps: {
      resource: 'classes',
      pagination: {
        pageSize: 10,
        mode: 'server',
      },
      filters: {
        permanent: [...searchFilters, ...subjectFilters, ...teacherFilters],
      },
      sorters: {
        initial: [{ field: 'id', order: 'desc' }],
      },
    },
  })

  return (
    <ListView>
      <Breadcrumb />

      <h1 className="page-title">Classes</h1>

      <div className="intro-row">
        <p>Quick access to essential metrics and management tools.</p>

        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by name..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CreateButton resource="classes" />
          </div>
        </div>
      </div>

      <DataTable table={classTable} />
    </ListView>
  )
}

export default ClassList