import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { UserPlus, Filter, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import AssignmentModal from '@/components/AssignmentModal';
import { toast } from 'sonner';

export default function TeamAssignmentPanel() {
  const { currentUser, activeOrganizationId } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    teamMember: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'assigned_date',
    direction: 'desc'
  });

  useEffect(() => {
    fetchData();
  }, [currentUser, activeOrganizationId]);

  const fetchData = async () => {
    if (!activeOrganizationId) return;

    setLoading(true);
    try {
      const [assignmentRecords, memberRecords] = await Promise.all([
        pb.collection('service_assignments').getFullList({
          filter: `service_id.organization_id = "${activeOrganizationId}"`,
          expand: 'service_id,team_member_id',
          sort: '-assigned_date',
          $autoCancel: false
        }),
        pb.collection('users').getFullList({
          filter: `organization_id = "${activeOrganizationId}" && status = "active"`,
          sort: 'name',
          $autoCancel: false
        })
      ]);

      setAssignments(assignmentRecords);
      setTeamMembers(memberRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getFilteredAndSortedAssignments = () => {
    let filtered = [...assignments];

    if (filters.teamMember) {
      filtered = filtered.filter(a => a.team_member_id === filters.teamMember);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(a => new Date(a.assigned_date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(a => new Date(a.assigned_date) <= new Date(filters.dateTo));
    }

    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'assigned_date':
          aValue = new Date(a.assigned_date);
          bValue = new Date(b.assigned_date);
          break;
        case 'service':
          aValue = a.expand?.service_id?.name || '';
          bValue = b.expand?.service_id?.name || '';
          break;
        case 'member':
          aValue = a.expand?.team_member_id?.name || '';
          bValue = b.expand?.team_member_id?.name || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const getInitials = (name) => {
    if (!name) return 'TM';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const filteredAssignments = getFilteredAndSortedAssignments();

  return (
    <>
      <Helmet>
        <title>Team assignments - WorshipStage Pro</title>
        <meta name="description" content="Manage team member assignments to services" />
      </Helmet>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team assignments</h1>
            <p className="text-muted-foreground">Manage team member assignments to services</p>
          </div>

          <Button onClick={() => setAssignmentModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Assign member
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-member">Team member</Label>
              <Select value={filters.teamMember} onValueChange={(value) => setFilters({ ...filters, teamMember: value })}>
                <SelectTrigger id="filter-member">
                  <SelectValue placeholder="All members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All members</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-from">Date from</Label>
              <Input
                id="filter-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-to">Date to</Label>
              <Input
                id="filter-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(filters.teamMember || filters.dateFrom || filters.dateTo || filters.status) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ teamMember: '', dateFrom: '', dateTo: '', status: '' })}
              >
                Clear filters
              </Button>
            </div>
          )}
        </Card>

        {/* Assignments Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('service')}
                      className="font-semibold"
                    >
                      Service
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('assigned_date')}
                      className="font-semibold"
                    >
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('member')}
                      className="font-semibold"
                    >
                      Team member
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading assignments...
                    </TableCell>
                  </TableRow>
                ) : filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No assignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const service = assignment.expand?.service_id;
                    const member = assignment.expand?.team_member_id;
                    const avatarUrl = member?.avatar 
                      ? pb.files.getUrl(member, member.avatar) 
                      : undefined;

                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {service?.name || 'Unknown service'}
                        </TableCell>
                        <TableCell>
                          {assignment.assigned_date 
                            ? format(new Date(assignment.assigned_date), 'MMM d, yyyy')
                            : 'Not set'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-lg">
                              <AvatarImage src={avatarUrl} alt={member?.name} />
                              <AvatarFallback className="rounded-lg text-xs">
                                {getInitials(member?.name || member?.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member?.name || member?.email || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{assignment.role}</TableCell>
                        <TableCell>
                          <Badge variant={assignment.status === 'confirmed' ? 'default' : 'secondary'}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Assignment Modal */}
        <AssignmentModal
          open={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          onSuccess={fetchData}
        />
      </div>
    </>
  );
}
