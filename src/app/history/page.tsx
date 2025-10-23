
"use client"

import { useContext, useState, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthContext, ActivityLogItemType } from "@/context/auth-context"
import { format, parseISO } from "date-fns"
import { Search, RotateCcw } from "lucide-react"
import { useI18n } from "@/context/i18n-context"
import { Badge } from "@/components/ui/badge"

export default function HistoryPage() {
  const auth = useContext(AuthContext)
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<ActivityLogItemType | "all">(
    "all"
  )

  if (!auth || auth.isLoading) return null
  const { activityLog, restoreItem, role } = auth

  const filteredLog = useMemo(() => {
    let log = [...activityLog].sort(
      (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    )

    if (activeFilter !== "all") {
      log = log.filter((item) => item.type === activeFilter)
    }

    if (searchQuery) {
      log = log.filter((item) =>
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return log
  }, [activityLog, activeFilter, searchQuery])

  const typeFilters: (ActivityLogItemType | "all")[] = [
    "all",
    "user",
    "product",
    "order",
    "customer",
  ]

  const getBadgeVariant = (type: ActivityLogItemType) => {
    switch (type) {
      case "user":
        return "default"
      case "product":
        return "secondary"
      case "order":
        return "destructive"
      case "customer":
        return "outline"
      default:
        return "secondary"
    }
  }

  const translateType = (type: ActivityLogItemType) => {
    switch(type) {
        case 'user': return t('history_type_user');
        case 'product': return t('history_type_product');
        case 'order': return t('history_type_order');
        case 'customer': return t('history_type_customer');
        default: return type;
    }
  }

  if (role !== "genel_mudur") {
    return (
      <AppLayout>
        <PageHeader title={t("unauthorized_title")} />
        <p>{t("unauthorized_desc")}</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <PageHeader title={t("history_title")} />
      <Card>
        <CardHeader>
          <CardTitle>{t("history_log_title")}</CardTitle>
          <CardDescription>{t("history_log_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("history_search_placeholder")}
                className="w-full ps-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {typeFilters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  onClick={() => setActiveFilter(filter)}
                  className="shrink-0"
                >
                  {filter === "all" ? t("tabs_all") : translateType(filter as ActivityLogItemType)}
                </Button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("history_table_date")}</TableHead>
                  <TableHead>{t("history_table_type")}</TableHead>
                  <TableHead>{t("history_table_description")}</TableHead>
                  <TableHead className="text-end">{t("table_actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLog.length > 0 ? (
                  filteredLog.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.deletedAt ? format(parseISO(item.deletedAt), "dd/MM/yyyy HH:mm") : '...'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(item.type)}>
                          {translateType(item.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => restoreItem(item.id)}
                        >
                          <RotateCcw className="me-2 h-4 w-4" />
                          {t("history_restore")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      {t("history_no_records")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
