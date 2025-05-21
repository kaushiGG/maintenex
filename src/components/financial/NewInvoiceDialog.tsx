
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const invoiceFormSchema = z.object({
  clientId: z.string().min(1, { message: 'Please select a client' }),
  invoiceNumber: z.string().min(1, { message: 'Invoice number is required' }),
  issueDate: z.date(),
  dueDate: z.date(),
  items: z.array(z.object({
    description: z.string().min(1, { message: 'Description is required' }),
    quantity: z.number().positive({ message: 'Quantity must be positive' }),
    unitPrice: z.number().positive({ message: 'Price must be positive' }),
    tax: z.number().min(0, { message: 'Tax must be positive or zero' }),
  })),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface NewInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onInvoiceCreated?: (invoice: any) => void;
}

interface Client {
  id: string;
  name: string;
}

const NewInvoiceDialog: React.FC<NewInvoiceDialogProps> = ({
  open,
  onClose,
  onInvoiceCreated,
}) => {
  const { toast } = useToast();

  // Mock clients data - in a real app, this would come from an API or context
  const clients: Client[] = [
    { id: '1', name: 'ABC Corporation' },
    { id: '2', name: 'XYZ Ltd' },
    { id: '3', name: 'Tech Solutions' },
    { id: '4', name: 'Global Enterprises' },
    { id: '5', name: 'SmallBiz Inc' },
  ];

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-`,
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      items: [{ description: '', quantity: 1, unitPrice: 0, tax: 0 }],
      notes: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const items = form.watch('items') || [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  const totalTax = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0) * (item.tax || 0) / 100, 0);
  const total = subtotal + totalTax;

  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call to create the invoice
      console.log("Creating invoice with data:", data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newInvoice = {
        id: Math.random().toString(36).substring(2, 9),
        invoiceNumber: data.invoiceNumber,
        client: clients.find(c => c.id === data.clientId)?.name || '',
        issueDate: format(data.issueDate, 'yyyy-MM-dd'),
        dueDate: format(data.dueDate, 'yyyy-MM-dd'),
        amount: total,
        status: 'pending',
        items: data.items,
      };
      
      if (onInvoiceCreated) {
        onInvoiceCreated(newInvoice);
      }
      
      toast({
        title: "Invoice created",
        description: `Invoice ${data.invoiceNumber} has been created successfully`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error creating invoice",
        description: "There was an error creating the invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    const currentItems = form.getValues('items') || [];
    form.setValue('items', [...currentItems, { description: '', quantity: 1, unitPrice: 0, tax: 0 }]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items') || [];
    if (currentItems.length > 1) {
      form.setValue('items', currentItems.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Invoice</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new invoice.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Items</h3>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={addItem}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {form.watch('items')?.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => {
                          const items = [...form.getValues('items')];
                          items[index].description = e.target.value;
                          form.setValue('items', items);
                        }}
                      />
                      {form.formState.errors.items?.[index]?.description && (
                        <p className="text-sm text-red-500">{form.formState.errors.items[index]?.description?.message}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const items = [...form.getValues('items')];
                          items[index].quantity = Number(e.target.value);
                          form.setValue('items', items);
                        }}
                      />
                      {form.formState.errors.items?.[index]?.quantity && (
                        <p className="text-sm text-red-500">{form.formState.errors.items[index]?.quantity?.message}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const items = [...form.getValues('items')];
                          items[index].unitPrice = Number(e.target.value);
                          form.setValue('items', items);
                        }}
                      />
                      {form.formState.errors.items?.[index]?.unitPrice && (
                        <p className="text-sm text-red-500">{form.formState.errors.items[index]?.unitPrice?.message}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Tax %"
                        value={item.tax}
                        onChange={(e) => {
                          const items = [...form.getValues('items')];
                          items[index].tax = Number(e.target.value);
                          form.setValue('items', items);
                        }}
                      />
                      {form.formState.errors.items?.[index]?.tax && (
                        <p className="text-sm text-red-500">{form.formState.errors.items[index]?.tax?.message}</p>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={form.getValues('items').length <= 1}
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalTax)}</span>
                </div>
                <div className="flex justify-between font-medium mt-2 text-lg">
                  <span>Total:</span>
                  <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}</span>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes for the invoice"
                      className="h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewInvoiceDialog;
